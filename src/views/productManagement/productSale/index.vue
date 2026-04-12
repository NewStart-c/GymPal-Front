<template>
  <div class="app-container">
    <!-- 主体布局：商品列表 + 购物车/支付 -->
    <el-row :gutter="20">

      <!-- 商品列表区域 -->
      <el-col :span="16">

        <!-- 搜索栏 -->
        <el-form :model="searchForm" inline class="search-form" ref="searchRef">
          <el-form-item style="width: 50%">
            <el-input
                v-model="searchForm.keyword"
                placeholder="搜索商品名称或编码"
                style="width: 100%"
                prefix-icon="Search"
                clearable
                @keyup.enter="getProductList"
            />
          </el-form-item>
          <el-form-item label="" prop="category">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 120px">
              <el-option label="运动器材" value="equipment"></el-option>
              <el-option label="营养补剂" value="supplement"></el-option>
              <el-option label="周边配件" value="accessory"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getProductList">搜索</el-button>
            <el-button icon="Refresh" @click="resetSearch">重置</el-button>
            <el-button type="primary" @click="handleScan">
              <svg-icon icon-class="扫一扫" />
              扫码
            </el-button>
          </el-form-item>

        </el-form>

        <div class="product-list-container">
          <div class="list-header">
            <span class="title">商品列表</span>
            <span class="total">共 {{ total }} 件商品</span>
          </div>
          <!-- 商品卡片网格 -->
          <el-row :gutter="20" class="product-card-grid">
            <el-col :span="8" v-for="item in productList" :key="item.productId">
              <el-card shadow="hover" class="product-card">
                <div class="product-img">
                  <!-- 这里必须是 img 不是 image！！！ -->
                  <img
                      :src="item.imageUrls ? '/dev-api' + item.imageUrls.split(',')[0] : '/dev-api/profile/default-product.png'"
                      alt="商品图片"
                  />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-code">编码：{{ item.productCode || 'P00' + item.productId }}</div>
                  <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
                  <div class="product-stock">库存：{{ item.stockQuantity }}</div>
                  <el-button
                      type="primary"
                      size="small"
                      style="width: 100%"
                      @click="addToCart(item)"
                      :disabled="item.stockQuantity <= 0"
                  >
                    {{ item.stockQuantity > 0 ? '加入购物车' : '已售罄' }}
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- 购物车 + 支付区域 -->
      <el-col :span="8">
        <div class="cart-payment-container">
          <!-- 会员信息 -->
          <div class="member-section">
            <div class="label" style="margin-bottom: 10px">会员信息</div>
            <el-button type="primary" plain icon="User" @click="selectMember">选择会员</el-button>
          </div>

          <!-- 购物车 -->
          <div class="cart-section">
            <div class="cart-header">
              <span class="label">购物车</span>
              <el-button type="text" icon="Delete" @click="clearCart" class="clear-btn">清空</el-button>
            </div>
            <div class="cart-empty" v-if="cartList.length === 0">
              <el-icon><ShoppingCart /></el-icon>
              <p>请选择商品添加到购物车</p>
            </div>
            <div class="cart-items" v-else>
              <div class="cart-item" v-for="item in cartList" :key="item.productId">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
                <el-input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    :max="item.stockQuantity"
                    @change="calcCartTotal"
                    class="quantity-input"
                />
                <el-button type="text" icon="Close" @click="removeFromCart(item.productId)"></el-button>
              </div>
            </div>
            <div class="cart-total" v-if="cartList.length > 0">
              <div>商品总价：<span class="price">¥{{ totalPrice.toFixed(2) }}</span></div>
              <div>优惠金额：<span class="discount">-¥0.00</span></div>
              <div>应收金额：<span class="final-price">¥{{ totalPrice.toFixed(2) }}</span></div>
            </div>
          </div>

          <!-- 支付方式 -->
          <div class="payment-section">
            <div class="label">支付方式</div>
            <!-- 2x2 网格布局 -->
            <el-row :gutter="16" class="pay-grid">
              <el-col :span="12">
                <div class="pay-item" @click="payType = 'cash'" :class="{ active: payType === 'cash' }">
                  <svg-icon icon-class="cash" class="pay-icon" />
                  <span class="pay-text">现金</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="pay-item" @click="payType = 'wechat'" :class="{ active: payType === 'wechat' }">
                  <svg-icon icon-class="wechat" class="pay-icon" />
                  <span class="pay-text">微信</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="pay-item" @click="payType = 'alipay'" :class="{ active: payType === 'alipay' }">
                  <svg-icon icon-class="alipay" class="pay-icon" />
                  <span class="pay-text">支付宝</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="pay-item" @click="payType = 'balance'" :class="{ active: payType === 'balance' }">
                  <svg-icon icon-class="coin" class="pay-icon" />
                  <span class="pay-text">储值</span>
                </div>
              </el-col>
            </el-row>

            <!-- 结算/打印按钮 -->
            <el-button
                type="primary"
                style="width: 100%; margin-top: 20px; height: 40px; font-size: 16px"
                @click="handlePay"
                :disabled="cartList.length === 0"
            >
              <el-icon><Tickets /></el-icon>
              结算 (¥{{ totalPrice.toFixed(2) }})
            </el-button>
            <el-button
                type="default"
                style="width: 100%; margin: 10px 0 0 0; height: 40px; font-size: 16px"
                :disabled="cartList.length === 0"
            >
              <el-icon><Printer /></el-icon>
              打印小票
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="ProductSales">
import { ref, reactive, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listProduct } from '@/api/productManagement/product' // 复用商品列表接口

// 状态定义
const searchRef = ref(null)
const productList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: ''
})

// 购物车
const cartList = ref([])
const totalPrice = ref(0)
const payType = ref('wechat') // 默认微信支付

// 查询商品列表
function getProductList() {
  loading.value = true
  // 拼接查询条件：名称/编码 + 分类
  const query = {
    pageNum: 1,
    pageSize: 99, // 一次性加载所有商品（可根据实际调整）
    productName: searchForm.keyword || undefined,
    category: searchForm.category || undefined
  }
  listProduct(query).then(res => {
    productList.value = res.rows
    total.value = res.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 重置搜索
function resetSearch() {
  searchForm.keyword = ''
  searchForm.category = ''
  if (searchRef.value) {
    searchRef.value.resetFields()
  }
  getProductList()
}

// 扫码（预留逻辑）
function handleScan() {
  ElMessage.info('扫码功能待开发')
}

// 加入购物车
function addToCart(product) {
  const existItem = cartList.value.find(item => item.productId === product.productId)
  if (existItem) {
    existItem.quantity += 1
  } else {
    cartList.value.push({
      ...product,
      quantity: 1
    })
  }
  calcCartTotal()
  ElMessage.success(`已添加【${product.productName}】到购物车`)
}

// 移除购物车项
function removeFromCart(productId) {
  cartList.value = cartList.value.filter(item => item.productId !== productId)
  calcCartTotal()
}

// 清空购物车
function clearCart() {
  ElMessageBox.confirm('是否清空购物车？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    cartList.value = []
    calcCartTotal()
  }).catch(() => {})
}

// 计算购物车总价
function calcCartTotal() {
  totalPrice.value = cartList.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// 选择会员（预留）
function selectMember() {
  ElMessage.info('会员选择功能待开发')
}

// 支付逻辑
function handlePay() {
  if (cartList.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  // 组装支付参数
  const payParams = {
    cartList: cartList.value,
    totalPrice: totalPrice.value,
    payType: payType.value,
    memberId: null // 后续对接会员ID
  }
  // 调用支付接口（需后端提供）
  ElMessage.success('支付成功，待对接后端接口')
  console.log('支付参数：', payParams)
  // 支付成功后清空购物车
  cartList.value = []
  totalPrice.value = 0
}

// 初始化加载商品
getProductList()
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

// 面包屑与时间
.bread-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .time-info {
    color: #666;
    font-size: 14px;
  }
}

// 搜索栏
.search-form {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  display: flex;
}

/* 让 el-form-item 自身也垂直居中 */
.search-form :deep(.el-form-item) {
  display: flex;
  margin-bottom: 0 !important;
}

// 商品列表容器
.product-list-container {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  .list-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .total {
      color: #999;
    }
  }
  // 商品卡片网格
  .product-card-grid {
    .el-col {
      margin-bottom: 20px;
    }
  }
}

// 商品卡片样式
.product-card {
  .product-img {
    width: 100%;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
  .product-info {
    padding: 10px;
    .product-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 5px;
    }
    .product-code {
      font-size: 12px;
      color: #999;
      margin-bottom: 5px;
    }
    .product-price {
      font-size: 16px;
      color: #f56c6c;
      margin-bottom: 10px;
    }
    .product-stock {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
  }
}

// 购物车+支付容器
.cart-payment-container {


  border-radius: 10px;
  // 会员区域
  .member-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    .label {
      font-size: 16px;
      font-weight: 600;
    }
  }
  // 购物车区域
  .cart-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .label{
        font-size: 16px;
        font-weight: 600;
      }
      .clear-btn {
        color: #999;
      }
    }
    .cart-empty {
      text-align: center;
      padding: 40px 0;
      color: #999;
      svg {
        font-size: 40px;
        margin-bottom: 10px;
      }
    }
    .cart-items {
      max-height: 200px;
      overflow-y: auto;
      .cart-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        .item-name {
          flex: 1;
        }
        .item-price {
          width: 80px;
          text-align: center;
        }
        .quantity-input {
          width: 60px;
        }
      }
    }
    .cart-total {
      padding: 10px;
      background: #fafafa;
      border-radius: 10px;
      margin-top: 10px;
      .price {
        color: #666;
      }
      .discount {
        color: #f56c6c;
      }
      .final-price {
        font-size: 16px;
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }
  // 支付区域
  .payment-section {
    margin: 10px 0 0 0;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    .label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .pay-grid {
      margin-bottom: 0;
    }
    .pay-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80px;
      border: 1px solid #dcdfe6;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      margin-bottom: 16px;

      &:hover {
        border-color: #409eff;
      }
      &.active {
        border-color: #409eff;
        background-color: #ecf5ff;
      }
      .pay-icon {
        width: 20px;
        height: 20px;
        margin-bottom: 8px;
        color: #606266;
      }
      .pay-text {
        font-size: 18px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
}


</style>