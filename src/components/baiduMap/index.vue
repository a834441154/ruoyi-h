<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1000px"
      append-to-body
      @close="handleclose"
      
    >
    <div style="position: relative;">
      <el-select
        class="input-with-select"
        v-model="value"
        filterable
        remote
        reserve-keyword
        placeholder="请输入关键词"
        value-key="uid"
        :remote-method="remoteMethod"
        :loading="loading"
        @change="onChange">
        <el-option
          v-for="(item,index) in completeList"
          :key="index"
          :label="item.title"
          :value="item">
        </el-option>
      </el-select>
      <baidu-map class="map" center="北京" style="position: relative;" @ready="onMapReady" :scroll-wheel-zoom="true">
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
        <bm-local-search :keyword="keyword" :auto-viewport="true" :panel="false" @searchcomplete="searchcomplete" location="中国" class="search"></bm-local-search>
      </baidu-map>
    </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
// import { getPointByAddress } from 'vue2-baidu-map';
export default {
  components: {
    // BaiduMap
  },
  props: {
    openDialog: {
      type: Boolean,
      required: true,
    },
  },
  watch:{
    openDialog(val){
      this.open = val;
    },
  },
  computed:{
    
  },
  data(){
    return{
      title:'',
      keyword:'',
      timeout:  null,
      completeList:[],
      value:'',
      loading:false,
      mapPoint:'',
      BMap:'',
      open:this.openDialog,
    }
  },
  methods:{
    handleclose(){
      this.$emit('update:openDialog',false)
    },
     // 取消按钮
    cancel() {
      this.open = false
      this.$emit('onClose')
    },
     /** 提交按钮 */
    submitForm() {
      this.open = false
      this.$emit('onClose',this.mapPoint)
      this.value = '';
      this.keyword = ''
    },
    onSearchCity(){

    },
    searchcomplete(result){
      if(result){
        this.completeList = result.Yr;
      }
    },
    remoteMethod(query) {
      this.keyword = query
    },
    onChange(node){
      this.mapPoint = node;
      
    },
    onMapReady(BMap){
      this.BMap = BMap.BMap;
      this.$nextTick(()=>{
        this.value = '';
        this.keyword = ''
      })
    }
 
   
  }
}
</script>

<style lang="scss" scoped>
.input-with-select{
  position: absolute;
  top: 0;
  width: 373px;
  z-index: 999;
}
.map {
  width: 100%;
  height: 400px;
}
.search{
  position: absolute;
  top: 36px;
  height: 340px;
  overflow-y: auto;
}
</style>