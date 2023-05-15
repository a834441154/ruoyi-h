<template>
  <div>
    <el-card shadow="never" :body-style="{ padding: '0' }">
      <div slot="header" class="clearfix">
        <span>场站管理</span>
        <!-- <el-button style="float: right; padding: 3px 0" type="text"
          >管理</el-button
        > -->
        <el-dropdown
          style="float: right; padding: 3px 0"
          @command="handleCommand"
        >
          <span class="el-dropdown-link">
            管理<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-hasPermi="['system:region:add']" command="add"
              >创建场站</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <div class="search-container">
        <el-input
          v-model="stationName"
          placeholder="请输入场站名称"
          clearable
          prefix-icon="el-icon-search"
          style="margin-bottom: 20px"
        />
      </div>
      <div class="head-container">
        <el-tree
          :data="stationOptions"
          :props="defaultProps"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          ref="tree"
          node-key="id"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
          @node-contextmenu="openMenu"
        />
      </div>
    </el-card>

    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1000px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20" class="gz-form-row">
          <el-col :span="12">
            <el-form-item label="场站名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入场站名"
                :disabled="infoDisable"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="场地类型" prop="regionType">
              <el-radio-group v-model="form.regionType" :disabled="infoDisable">
                <el-radio
                  v-for="(item, index) in dict.type.region_type"
                  :key="index"
                  :label="item.value"
                  >{{ item.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.parentRegion">
            <el-form-item label="父级场站" prop="parentRegion">
              <treeselect
                v-model="form.parentRegion"
                :options="stationOptions"
                :show-count="true"
                :normalizer="normalizer"
                :disabled="infoDisable"
                :clearable="false"
                search-nested
                placeholder="请选择父级场站"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场站省市区" prop="installArea">
              <el-cascader
                v-model="form.installArea"
                :options="areaOptions"
                collapse-tags
                style="width: 100%"
                :props="{
                  expandTrigger: 'hover',
                  checkStrictly: true,
                  value: 'value',
                  label: 'text',
                }"
                :disabled="infoDisable"
                filterable
                clearable
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12"
            ><el-form-item label="联系人" prop="contacts">
              <el-input
                v-model="form.contacts"
                placeholder="请输入联系人"
                :disabled="infoDisable"
              /> </el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="详细地址" prop="address">
              <el-input
                v-model="form.address"
                placeholder="请输入详细地址"
                :disabled="infoDisable"
              >
                <el-button
                  slot="append"
                  icon="el-icon-map-location"
                  @click="openMapDialog = true"
                  :disabled="infoDisable"
                ></el-button>
              </el-input> </el-form-item
          ></el-col>
          <!-- <el-col :span="12"
            ><el-form-item label="经纬度坐标" prop="location">
              <el-input
                v-model="form.location"
                placeholder="请输入经纬度坐标"
              /> </el-form-item
          ></el-col> -->

          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactMobile">
              <el-input
                v-model="form.contactMobile"
                placeholder="请输入联系电话"
                :disabled="infoDisable"
              /> </el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="备注" prop="remarks">
              <el-input
                type="textarea"
                v-model="form.remarks"
                placeholder="请输入备注"
                :disabled="infoDisable"
              /> </el-form-item
          ></el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="saveload"
          v-show="!infoDisable"
          @click="submitForm"
          >保 存</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 创建站点 -->
    <el-dialog
      :title="sTitle"
      :visible.sync="sOpen"
      width="1000px"
      append-to-body
    >
      <el-form ref="sform" :model="sform" :rules="srules" label-width="100px">
        <el-row :gutter="20" class="gz-form-row">
          <el-col :span="12" :offset="0">
            <el-form-item label="站点名称" prop="name">
              <el-input v-model="sform.name" placeholder="请输入站点名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="所属场地" prop="regionId">
              <!-- <el-input v-model="form.regionId" placeholder="请输入所属场地" /> -->
              <treeselect
                v-model="sform.regionId"
                :options="stationOptions"
                :show-count="true"
                :normalizer="normalizer"
                :clearable="false"
                search-nested
                placeholder="请选择父级场站"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="站点省市区" prop="installArea">
              <el-cascader
                v-model="sform.installArea"
                :options="areaOptions"
                collapse-tags
                style="width: 100%"
                :props="{
                  expandTrigger: 'hover',
                  checkStrictly: true,
                  value: 'value',
                  label: 'text',
                }"
                clearable
                filterable
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="sform.address" placeholder="请输入详细地址">
                <el-button
                  slot="append"
                  icon="el-icon-map-location"
                  @click="openMapDialog = true"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="联系人" prop="contacts">
              <el-input v-model="sform.contacts" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="联系电话" prop="contactMobile">
              <el-input
                v-model="sform.contactMobile"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="sform.remarks"
                type="textarea"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitsForm">确 定</el-button>
        <el-button @click="sCancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 右键功能 -->
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="handleAdd()" v-hasPermi="['system:region:add']">
        创建子场站
      </li>
      <li v-hasPermi="['system:region:add']" @click="shandleAdd">创建站点</li>
      <li v-hasPermi="['system:region:edit']" @click="handleUpdate(false)">
        编辑
      </li>
      <li @click="handleUpdate(true)">详情</li>
      <li
        v-hasPermi="['system:region:remove']"
        @click="handleDelete"
        v-if="selectedTag.parent != null"
      >
        删除
      </li>
    </ul>
    <baiduMap :openDialog.sync="openMapDialog" @onClose="onMapClose"></baiduMap>
  </div>
</template>

<script>
import {
  getRegion,
  delRegion,
  addRegion,
  updateRegion,
  getRegTree,
} from "@/api/system/region";
import { addStation, updateStation } from "@/api/system/station";
import { getCity } from "@/api/public";
import baiduMap from "@/components/baiduMap";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  components: { Treeselect, baiduMap },
  dicts: ["region_type"],
  data() {
    return {
      stationName: "",
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 树选项
      stationOptions: [],
      areaOptions: [],

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      form: {
        installArea: [],
        parentRegion: "",
      },
      // 创建站点窗口
      // 弹出层标题
      sTitle: "",
      // 是否显示弹出层
      sOpen: false,
      sform: {},
      srules: {
        name: [
          { required: true, message: "站点名称不能为空", trigger: "blur" },
        ],
        regionId: [
          { required: true, message: "所属场地不能为空", trigger: "blur" },
        ],
        stationCode: [
          { required: true, message: "站点编码不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" },
        ],
        createBy: [
          { required: true, message: "创建人不能为空", trigger: "blur" },
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" },
        ],
        updateBy: [
          { required: true, message: "更新人不能为空", trigger: "blur" },
        ],
        delTime: [
          { required: true, message: "删除时间不能为空", trigger: "blur" },
        ],
        installArea: [
          { required: true, message: "省市区不能为空", trigger: "blur" },
        ],
        address: [
          { required: true, message: "详细地址不能为空", trigger: "blur" },
        ],
      },

      saveload: false,
      infoDisable: false,
      rules: {
        name: [{ required: true, message: "场站名不能为空", trigger: "blur" }],
        regionType: [
          { required: true, message: "场站类型不能为空", trigger: "change" },
        ],
        regionCode: [
          { required: true, message: "场站编码不能为空", trigger: "blur" },
        ],
        parentRegion: [
          { required: true, message: "父级场站不能为空", trigger: "blur" },
        ],
      },
      infoType: false,

      normalizer(node) {
        return {
          id: node.value,
          label: node.label,
          children: node.children,
        };
      },

      // 右键功能
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},

      // 打开地图
      openMapDialog: false,
    };
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
    // 根据名称筛选部门树
    stationName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getAreaCity();
    this.getRegionTree();
  },
  methods: {
    getAreaCity() {
      getCity().then((res) => {
        this.areaOptions = res.data;
      });
    },
    getRegionTree() {
      getRegTree().then((res) => {
        this.stationOptions = res.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.$emit("onNodeClick", data);
    },
    // 地图关闭回掉
    onMapClose(point) {
      console.log(point);
      if (this.open) {
        this.form.address = point.address + `(${point.title})`;
      } else {
        this.sform.address = point.address + `(${point.title})`;
      }
    },

    handleCommand(command) {
      switch (command) {
        case "add":
          this.handleAdd();
          break;

        default:
          break;
      }
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.$nextTick(() => {
        if (this.selectedTag.value) {
          this.form.parentRegion = this.selectedTag.value;
        } else {
          this.form.parentRegion = this.stationOptions[0].value;
        }
      });
      this.open = true;
      this.reset();

      this.title = "创建场站";
    },

    /** 修改按钮操作 */
    handleUpdate(type) {
      this.infoDisable = type;
      this.reset();
      const id = this.selectedTag.value;
      getRegion(id).then((response) => {
        this.form = response.data;
        this.form.installArea = [
          this.form.provinceId,
          this.form.cityId,
          this.form.areaId,
        ];
        this.open = true;
        this.title = "修改场站";
      });
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.selectedTag = {};
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        regionType: null,
        regionCode: null,
        parentRegion: null,
        provinceId: null,
        cityId: null,
        areaId: null,
        address: null,
        location: null,
        contacts: null,
        contactMobile: null,
        remarks: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delTime: null,
      };
      this.resetForm("form");
    },

    /** 提交按钮 */
    submitForm() {
      this.saveload = true;
      let node = this.form.installArea;
      this.form.provinceId = node[0] ? node[0] : "";
      this.form.cityId = node[1] ? node[1] : "";
      this.form.areaId = node[2] ? node[2] : "";
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateRegion(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.saveload = false;
              this.getRegionTree();
            });
          } else {
            addRegion(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.saveload = false;
              this.getRegionTree();
            });
          }
        }
      });
    },

    // 创建站点窗口
    /** 新增按钮操作 */
    shandleAdd() {
      this.$nextTick(() => {
        if (this.selectedTag.value) {
          this.sform.regionId = this.selectedTag.value;
        } else {
          this.sform.regionId = this.stationOptions[0].value;
        }
      });
      this.sreset();
      this.sOpen = true;
      this.sTitle = "添加站点";
    },
    // 取消按钮
    sCancel() {
      this.sOpen = false;
      this.sreset();
    },
    // 表单重置
    sreset() {
      this.sform = {
        id: null,
        name: null,
        regionId: null,
        stationCode: null,
        provinceId: null,
        cityId: null,
        areaId: null,
        address: null,
        location: null,
        contacts: null,
        contactMobile: null,
        remarks: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
        delTime: null,
      };
      this.resetForm("sform");
    },

    /** 提交按钮 */
    submitsForm() {
      if (this.sform.installArea) {
        let node = this.sform.installArea;
        this.sform.provinceId = node[0] ? node[0] : "";
        this.sform.cityId = node[1] ? node[1] : "";
        this.sform.areaId = node[2] ? node[2] : "";
      }
      this.$refs["sform"].validate((valid) => {
        if (valid) {
          if (this.sform.id != null) {
            updateStation(this.sform).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.sOpen = false;
              this.$emit("onNodeClick");
            });
          } else {
            addStation(this.sform).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.sOpen = false;
              this.$emit("onNodeClick");
            });
          }
        }
      });
    },

    // 右键功能
    openMenu(e, tag) {
      console.log(tag);
      const menuMinWidth = 105;
      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const offsetWidth = this.$el.offsetWidth; // container width
      const maxLeft = offsetWidth - menuMinWidth; // left boundary
      const left = e.clientX - offsetLeft; // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft;
      } else {
        this.left = left;
      }

      this.top = e.clientY - 100;
      this.visible = true;
      this.selectedTag = tag;
    },

    closeMenu() {
      this.visible = false;
    },

    /** 删除按钮操作 */
    handleDelete() {
      const ids = this.selectedTag.value;
      this.$modal
        .confirm("是否确认删除？")
        .then(function () {
          return delRegion(ids);
        })
        .then(() => {
          this.getRegionTree();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.search-container {
  // background: #efefef;
  padding: 10px;
  height: 55px;
  border-bottom: 1px solid #e6ebf5;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  li {
    margin: 0;
    padding: 7px 16px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}
.gz-form-row {
  display: flex;
  flex-wrap: wrap;
}
::v-deep .vue-treeselect--disabled .vue-treeselect__control {
  background-color: #f5f7fa;
  cursor: not-allowed;
}
::v-deep .vue-treeselect--disabled .vue-treeselect__single-value {
  color: #c0c4cc;
  background-color: #f5f7fa;
  border-color: #dfe4ed;
}
</style>