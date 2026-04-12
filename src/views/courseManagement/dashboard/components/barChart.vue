<template>
  <div ref="barRef" class="chart" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: { type: Array, default: () => [] },
  height: { type: Number, default: 320 }
})

const barRef = ref(null)
let chart = null

const init = () => {
  if (!barRef.value) return
  chart = echarts.init(barRef.value)
  const names = props.chartData.map(i => i.name)
  const values = props.chartData.map(i => i.value)

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { interval: 0, rotate: 0 }
    },
    yAxis: { type: 'value' },
    series: [{
      data: values,
      type: 'bar',
      itemStyle: { color: '#409EFF' }
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