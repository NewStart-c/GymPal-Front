<template>
  <div ref="lineRef" class="chart" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: { type: Array, default: () => [] },
  height: { type: Number, default: 320 }
})

const lineRef = ref(null)
let chart = null

const init = () => {
  if (!lineRef.value) return
  chart = echarts.init(lineRef.value)
  const dates = props.chartData.map(i => i.date)
  const rates = props.chartData.map(i => i.value)

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [{
      data: rates,
      type: 'line',
      smooth: true,
      itemStyle: { color: '#67C23A' }
    }]
  }
  chart.setOption(option)
}

watch(() => props.chartData, () => init(), { deep: true })

onMounted(() => {
  nextTick(init)
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chart?.resize())
  chart?.dispose()
})
</script>

<style scoped>
.chart { width: 100%; }
</style>