import userModel from "../models/userModel.js";

// Adicionar produto à wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    let wishlist = userData.wishlist;

    // Verificar se o produto já está na wishlist
    if (wishlist.includes(productId)) {
      return res.json({ success: false, message: "Produto já está nos favoritos" });
    }

    // Adicionar produto à wishlist
    wishlist.push(productId);

    await userModel.findByIdAndUpdate(userId, { wishlist });

    res.json({
      success: true,
      message: "Produto adicionado aos favoritos",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Remover produto da wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    let wishlist = userData.wishlist;

    // Remover produto da wishlist
    wishlist = wishlist.filter(id => id !== productId);

    await userModel.findByIdAndUpdate(userId, { wishlist });

    res.json({
      success: true,
      message: "Produto removido dos favoritos",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Obter wishlist do usuário
const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      wishlist: userData.wishlist,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist };