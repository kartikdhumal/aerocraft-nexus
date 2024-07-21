import { ObjectId } from 'mongodb';

export const addtoCart = async (req, res) => {
    try {
        const db = client.db();
        const { modelId, quantity, userId } = req.body;
        const existingCartItem = await db.collection('cart').findOne({ modelId: modelId, userId: userId });

        if (existingCartItem) {
            return res.status(400).json({ message: 'Model already added to cart' });
        }

        if (!modelId || !quantity || !userId || isNaN(quantity)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        const newCartItem = {
            modelId,
            quantity,
            userId
        };

        const result = await db.collection('cart').insertOne(newCartItem);
        res.status(201).json({ message: 'Added to cart' });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const cartItemCountByID = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = client.db();

        const cartCount = await db.collection('cart').aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]).toArray();

        let itemCount = 0;

        if (cartCount && cartCount.length > 0 && cartCount[0].count) {
            itemCount = cartCount[0].count;
        }

        res.status(200).json({ count: itemCount });
    } catch (error) {
        console.error('Error counting cart items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCarts = async (req, res) => {
    try {
        const db = client.db();
        const cart = await db.collection('cart').find().toArray();
        if (!cart || cart.length === 0) {
            return res.status(404).json({ error: 'No cart found' });
        }
        return res.status(200).json({ cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export const getCartByuserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const db = client.db();
        const cartItems = await db.collection('cart').find({ userId: userId }).toArray();

        res.status(200).json({ cartItems: cartItems });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateCartItemQuantity = async (req,res) => {
    try {
        const { cartId, quantity } = req.body;
        const db = client.db();
        if (!cartId || !quantity || quantity < 0 || quantity > 10) {
          return res.status(400).json({ message: 'Invalid cartId or quantity' });
        }
        const cart = await db.collection('cart').findOne({ _id: new ObjectId(cartId) });
        const updatedCart = await db.collection('cart').findOneAndUpdate(
          { _id: cart._id },
          { $set: { quantity: quantity } },
          { new: true }
        );
    
        if (!updatedCart) {
          return res.status(404).json({ message: `Cart item not found ${cart}` });
        }
    
        return res.status(200).json({ message: 'Updated Cart Quantity', cart: updatedCart.value });
      } catch (error) {
        console.error('Error updating cart item quantity:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
}

export const deleteCartByID = async (req,res) => {
    try {
        const db = client.db();
        const id = req.params.id;
        const cartData = await db.collection('cart').findOneAndDelete({ _id: new ObjectId(id) });
    
        if (cartData) {
          res.json({ message: 'Cart deleted successfully' });
        } else {
          res.status(404).json({ message: 'Cart not found' });
        }
      } catch (error) {
        res.status(500).json({ message: `Error deleting cart in server ${error}` });
      }
}