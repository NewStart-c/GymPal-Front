<template>
  <div ref="pieChartRef" class="chart-container" :style="{ height: chartHeight + 'px' }"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  chartHeight: {
    type: Number,
    default: 300
  }
})

const pieChartRef = ref(null)
let myChart = null

const initChart = () => {
  if (!pieChartRef.value) return
  myChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} <br/>金额：¥{c} <br/>占比：{d}%'
    },
    series: [
      {
        name: '收入占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData.map(item => ({
          name: item.type,
          value: item.value,
          itemStyle: {color: item.color}
        }))
      }
    ]
  }
  myChart.setOption(option)
}

watch(() => props.chartData, () => {
  nextTick(() => initChart())
}, {deep: true})

onMounted(() => {
  nextTick(() => initChart())
  window.addEventListener('resize', () => myChart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => myChart?.resize())
  myChart?.dispose()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>