const variants = JSON.parse(
  document.getElementById("ProductVariants").textContent,
);
//console.log(variants);

const selectVariant = document.getElementById("VariantSelect");
const addCartButton = document.getElementById("AddToCartButton");
const productImage = document.getElementById("ProductMainImage");
const thumbnailButtons = document.querySelectorAll(".product-media__thumbnail");
const productForm = document.getElementById("ProductForm");
const cartCount = document.querySelector(
  '#cart-icon-bubble .cart-count-bubble span[aria-hidden="true"]',
);

selectVariant.addEventListener("change", handleVariantChange);
function handleVariantChange(event) {
  const selectedVariant = variants.find(
    (variant) => variant.id == event.target.value,
  );
  //console.log(selectedVariant);
  updateVariantId(selectedVariant);
  updateVariantPrice(selectedVariant);
  updateVariantComparePrice(selectedVariant);
  updateCartButton(selectedVariant);
  updateVariantUrl(selectedVariant);
  // updateVarianImages(selectedVariant);
  updateProductMedia(selectedVariant);
  updateActiveThumbnail(selectedVariant.featured_media.id);
}
function updateVariantId(selectedVariant) {
  document.getElementById("VariantId").value = selectedVariant.id;
}
function updateVariantPrice(selectedVariant) {
  document.querySelector("#ProductPrice .product__price-current").innerHTML =
    formatMoney(selectedVariant.price);
}
function updateVariantComparePrice(selectedVariant) {
  if (selectedVariant.compare_at_price) {
    document.querySelector("#ProductPrice .product__price-compare").innerHTML =
      formatMoney(selectedVariant.compare_at_price);
  } else {
    document.querySelector("#ProductPrice .product__price-compare").innerHTML =
      "";
  }
}
function formatMoney(money) {
  return `Rs. ${(money / 100).toLocaleString("en-IN")}`;
}
function updateCartButton(selectedVariant) {
  if (selectedVariant.available) {
    addCartButton.disabled = false;
    addCartButton.textContent = "Add To Cart";
  } else {
    addCartButton.disabled = true;
    addCartButton.textContent = "Sold Out";
  }
}
function updateVariantUrl(selectedVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set("variant", selectedVariant.id);
  window.history.replaceState({}, "", url.toString());
}
// function updateVarianImages(selectedVariant){
//     if(selectedVariant.featured_image){
//         const variantImage = document.getElementById("VariantImage");
//         variantImage.src = selectedVariant.featured_image.src;
//         variantImage.srcset = selectedVariant.featured_image.src;
//         variantImage.alt = selectedVariant.name;
//     }
//     else {
//         return
//     }
// }
function updateProductMedia(media) {
  if (!media || !media.featured_image) {
    return;
  }
  productImage.classList.add("is-loading");
  //console.log(productImage.className);
  const newImage = new Image();
  newImage.onload = function () {
    productImage.src = media.featured_image.src;
    productImage.srcset = media.featured_image.src;
    productImage.alt = media.featured_image.alt || media.name;

    productImage.classList.remove("is-loading");
  };
  newImage.src = media.featured_image.src;
}
thumbnailButtons.forEach((button) => {
  button.addEventListener("click", handleThumbnailClick);
});
function handleThumbnailClick(event) {
  //thumbnailButtons.forEach(btn => btn.classList.remove('is-active'));
  //console.log(event.currentTarget);
  const activeThumb = event.currentTarget;
  //activeThumb.classList.add('is-active');
  const media = {
    featured_image: {
      src: activeThumb.dataset.imageSrc,
      srcset: activeThumb.dataset.imageSrc,
    },
    name: activeThumb.dataset.imageAlt,
  };
  updateProductMedia(media);
  updateActiveThumbnail(activeThumb.dataset.mediaId);
}
function updateActiveThumbnail(mediaId) {
  thumbnailButtons.forEach((button) => {
    button.classList.remove("is-active");
  });
  const activeButton = document.querySelector(
    `.product-media__thumbnail[data-media-id="${mediaId}"]`,
  );
  if (activeButton) {
    activeButton.classList.add("is-active");
  }
}

productForm.addEventListener("submit", handleAddToCart);
async function handleAddToCart(event) {
  event.preventDefault();
  const formData = new FormData(productForm);
  // for (const [key, value] of formData.entries()) {
  //     console.log(key, value);
  // }
  try {
    addCartButton.disabled = true;
    addCartButton.textContent = "Adding...";
    const response = await fetch("/cart/add.js", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to add product to cart");
    }
    const data = await response.json();
    console.log(data);
    await updateCartCount();
    addCartButton.disabled = false;
    addCartButton.textContent = "Added ✓";
    setTimeout(() => {
      addCartButton.textContent = "Add To Cart";
    }, 2000);
  } catch (error) {
    addCartButton.disabled = false;
    addCartButton.textContent = "Add To Cart";
    console.error(error);
  }
}
async function updateCartCount() {
  try {
    const response = await fetch("/cart.js");
    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }
    const cart = await response.json();
    console.log(cart);
    cartCount.textContent = cart.item_count;
  } catch (error) {
    console.error(error);
  }
}
