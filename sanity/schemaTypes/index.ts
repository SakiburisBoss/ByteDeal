import { type SchemaTypeDefinition } from 'sanity'
import { productCategory } from './schemas/category'
import { product } from './schemas/product'
import { promotionCampaign } from './schemas/campaign'
import { promotionCode } from './schemas/promo-codes'
import { shippingAddress } from './schemas/order'
import { orderItem } from './schemas/order'
import { order } from './schemas/order'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productCategory, product, promotionCampaign, promotionCode,shippingAddress,orderItem,order],
}
