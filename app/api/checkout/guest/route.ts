// app/api/checkout/guest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!// ⚠️ Clé admin côté serveur
);

export async function POST(req: NextRequest) {
  try {
    const { cartItems, checkoutData, deliveryType } = await req.json();

    // ✅ Validation
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    if (!checkoutData.email || !checkoutData.name || !checkoutData.phone) {
      return NextResponse.json({ error: 'Informations manquantes' }, { status: 400 });
    }

    // ✅ 1. Vérifier le stock disponible
    const productIds = cartItems.map((item: any) => item.productId);
    const { data: products, error: stockError } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .in('id', productIds);

    if (stockError || !products) {
      return NextResponse.json({ error: 'Erreur de vérification du stock' }, { status: 500 });
    }

    // Vérifier chaque produit
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock_quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${item.productName}` 
        }, { status: 400 });
      }
    }

    // ✅ 2. Créer ou récupérer le client (guest)
    let customerId: string;

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', checkoutData.email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      
      // Mettre à jour les infos
      await supabase
        .from('customers')
        .update({
          name: checkoutData.name,
          phone: checkoutData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);
    } else {
      // Créer un compte si demandé
      if (checkoutData.createAccount) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: checkoutData.email,
          password: checkoutData.password,
          email_confirm: true,
        });

        if (authError || !authData.user) {
          return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 });
        }

        customerId = authData.user.id;

        await supabase.from('customers').insert({
          id: customerId,
          email: checkoutData.email,
          name: checkoutData.name,
          phone: checkoutData.phone,
        });
      } else {
        // Client invité (sans compte)
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            email: checkoutData.email,
            name: checkoutData.name,
            phone: checkoutData.phone,
            is_guest: true,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          return NextResponse.json({ error: 'Erreur création client' }, { status: 500 });
        }

        customerId = newCustomer.id;
      }
    }

    // ✅ 3. Créer l'adresse de livraison
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .insert({
        customer_id: customerId,
        ville: checkoutData.address.ville,
        commune: checkoutData.address.commune,
        quartier: checkoutData.address.quartier,
        avenue: checkoutData.address.avenue,
        numero_parcelle: checkoutData.address.numero_parcelle,
        reference: checkoutData.address.reference,
        preferred_delivery_day: checkoutData.address.preferred_delivery_day,
        is_default: true,
      })
      .select('id')
      .single();

    if (addressError || !address) {
      return NextResponse.json({ error: 'Erreur création adresse' }, { status: 500 });
    }

    // ✅ 4. Calculer les totaux
    const SHIPPING_COSTS = { standard: 3000, express: 5000 };
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const shippingCost = SHIPPING_COSTS[deliveryType as keyof typeof SHIPPING_COSTS];
    const totalAmount = subtotal + shippingCost;

    // ✅ 5. Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        address_id: address.id,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        delivery_type: deliveryType,
        status: 'pending', // En attente
        payment_method: 'cash_on_delivery',
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });
    }

    // ✅ 6. Créer les items de commande
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ error: 'Erreur création items' }, { status: 500 });
    }

    // ✅ 7. Déduire le stock
    for (const item of cartItems) {
      await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }

    // ✅ 8. Envoyer email de confirmation (optionnel)
    // await sendOrderConfirmationEmail(checkoutData.email, order);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });

  } catch (error: any) {
    console.error('Erreur checkout guest:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error.message 
    }, { status: 500 });
  }
}










// // app/api/checkout/guest/route.ts
// import { NextResponse } from 'next/server';
// import { createOrder } from '@/lib/supabase/queries';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
    
//     const { items, total, guestInfo } = body;

//     // Validation
//     if (!items || items.length === 0) {
//       return NextResponse.json(
//         { error: 'Le panier est vide' },
//         { status: 400 }
//       );
//     }

//     if (!guestInfo || !guestInfo.email || !guestInfo.name) {
//       return NextResponse.json(
//         { error: 'Informations client manquantes' },
//         { status: 400 }
//       );
//     }

//     // Créer la commande (sans userId pour invité)
//     const { order, error } = await createOrder({
//       items,
//       total,
//       userId: undefined // ⬅️ Pas d'userId pour invité
//     });

//     if (error || !order) {
//       return NextResponse.json(
//         { error: error || 'Erreur lors de la création de la commande' },
//         { status: 500 }
//       );
//     }

//     // TODO: Envoyer email de confirmation à guestInfo.email
//     // await sendOrderConfirmationEmail(guestInfo.email, order.id);

//     return NextResponse.json({
//       success: true,
//       orderId: order.id,
//       message: 'Commande créée avec succès'
//     });

//   } catch (error: unknown) {
//     console.error('Erreur API checkout guest:', error);
//     return NextResponse.json(
//       { error: 'Erreur serveur' },
//       { status: 500 }
//     );
//   }
// }