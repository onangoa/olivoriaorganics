HOW TO ADD PRODUCT IMAGES (this folder)
========================================

The 6 newest products already point to image files in this folder:

  almonds.jpg                    -> Organic Almonds
  roasted-cashew-nuts.jpg        -> Roasted Cashew Nuts
  eucalyptus-essential-oil.jpg   -> Eucalyptus Essential Oil
  peppermint-essential-oil.jpg   -> Peppermint Essential Oil
  lemongrass-essential-oil.jpg   -> Lemongrass Essential Oil
  oregano-essential-oil.jpg      -> Oregano Essential Oil

To add one:
  1. Take or choose your product photo (a square-ish photo of the product
     works best, e.g. the product in a bowl or on a clean surface).
  2. Save/copy it into THIS folder using the EXACT file name above
     (keep the .jpg ending - save your photo as JPG if needed).
  3. Done. The website picks it up automatically - run "npm run dev"
     and refresh the Products page, or "npm run build" to publish.
     Until you add the file, a placeholder image is shown instead.

To give ANY other product a local image:
  1. Save the photo here, e.g. my-photo.jpg
  2. Open src/data/products.json and set that product's "image" to
     "/assets/images/products/my-photo.jpg"
  3. Rebuild - done.
