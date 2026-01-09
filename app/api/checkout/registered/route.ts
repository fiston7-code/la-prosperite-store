// app/api/checkout/registered/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.SUPABASE_SERVICE_ROLE_KEY!// ⚠️ Clé admin côté serveur
);

export async function POST(req: NextRequest) {
  try {
    const { cartItems, addressId, newAddress, deliveryType } = await req.json();

    // ✅ 1. Récupérer l'utilisateur connecté
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // ✅ 2. Vérifier le stock
    const productIds = cartItems.map((item: unknown) => item.productId);
    const { data: products, error: stockError } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .in('id', productIds);

    if (stockError || !products) {
      return NextResponse.json({ error: 'Erreur vérification stock' }, { status: 500 });
    }

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock_quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${item.productName}` 
        }, { status: 400 });
      }
    }

    // ✅ 3. Gérer l'adresse
    let finalAddressId = addressId;

    if (!addressId && newAddress) {
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .insert({
          customer_id: user.id,
          ...newAddress,
        })
        .select('id')
        .single();

      if (addressError || !address) {
        return NextResponse.json({ error: 'Erreur création adresse' }, { status: 500 });
      }

      finalAddressId = address.id;
    }

    // ✅ 4. Calculer totaux
    const SHIPPING_COSTS = { standard: 3000, express: 5000 };
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const shippingCost = SHIPPING_COSTS[deliveryType as keyof typeof SHIPPING_COSTS];
    const totalAmount = subtotal + shippingCost;

    // ✅ 5. Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        address_id: finalAddressId,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        delivery_type: deliveryType,
        status: 'pending',
        payment_method: 'cash_on_delivery',
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });
    }

    // ✅ 6. Créer les items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }));

    await supabase.from('order_items').insert(orderItems);

    // ✅ 7. Déduire le stock
    for (const item of cartItems) {
      await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });

  } catch (error: unknown) {
    console.error('Erreur checkout registered:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}





// // app/api/checkout/registered/route.ts
// import { NextResponse } from 'next/server';
// import { createOrder } from '@/lib/supabase/queries';
// import { supabase } from '@/lib/supabase/client';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
    
//     const { items, total, userId } = body;

//     // Validation
//     if (!items || items.length === 0) {
//       return NextResponse.json(
//         { error: 'Le panier est vide' },
//         { status: 400 }
//       );
//     }

//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Utilisateur non authentifié' },
//         { status: 401 }
//       );
//     }

//     // Vérifier que l'utilisateur existe
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id, email, name')
//       .eq('id', userId)
//       .single();

//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'Utilisateur introuvable' },
//         { status: 404 }
//       );
//     }

//     // Créer la commande avec userId
//     const { order, error } = await createOrder({
//       items,
//       total,
//       userId
//     });

//     if (error || !order) {
//       return NextResponse.json(
//         { error: error || 'Erreur lors de la création de la commande' },
//         { status: 500 }
//       );
//     }

//     // TODO: Envoyer email de confirmation
//     // await sendOrderConfirmationEmail(user.email, order.id);

//     return NextResponse.json({
//       success: true,
//       orderId: order.id,
//       message: 'Commande créée avec succès'
//     });

//   } catch (error: unknown) {
//     console.error('Erreur API checkout registered:', error);
//     return NextResponse.json(
//       { error: 'Erreur serveur' },
//       { status: 500 }
//     );
//   }
// }