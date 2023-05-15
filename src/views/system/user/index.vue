<template>
  <div class="app-container">
    <!-- <el-row :gutter="20"> -->
    <!--部门数据-->
    <!-- <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col> -->
    <!--用户数据-->
    <!-- <el-col :span="20" :xs="24"> -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="姓名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="用户状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="角色" prop="userId">
        <el-select
          v-model="queryParams.userId"
          placeholder="用户状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in roleList"
            :key="dict.roleId"
            :label="dict.roleName"
            :value="dict.roleId"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item> -->
     
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery"
          >查 询</el-button
        >
        <el-button icon="el-icon-refresh" @click="resetQuery">重 置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['system:user:add']"
          >创建账号</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          :disabled="single"
          @click="handleUpdate({}, false)"
          v-hasPermi="['system:user:edit']"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:user:remove']"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-upload2"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              @click="handleExport"
              v-hasPermi="['system:user:export']"
            >导出</el-button>
          </el-col> -->
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
        :columns="columns"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
        label="用户编号"
        align="center"
        key="userId"
        prop="userId"
        width="80"
        v-if="columns[0].visible"
      />
      <!-- <el-table-column label="姓名" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" /> -->
      <el-table-column
        label="姓名"
        align="center"
        key="nickName"
        prop="nickName"
        v-if="columns[1].visible"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(scope.row, true)"
            >{{ scope.row.nickName }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column
        label="手机号码"
        align="center"
        key="userName"
        prop="userName"
        v-if="columns[2].visible"
        width="120"
      />
      <el-table-column
        label="状态"
        align="center"
        key="status"
        v-if="columns[3].visible"
      >
        <template slot-scope="scope">
          <span
            :class="{
              success: scope.row.status == 0,
              error: scope.row.status == 1,
            }"
            style="color: #a1a1a1"
          >
            {{ enableFormat(scope.row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="角色"
        align="center"
        key="roles"
        prop="dept.roles"
        v-if="columns[4].visible"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span v-for="(item,index) in scope.row.roles" :key="index"><span v-if="item">{{ item.roleName + `${index == scope.row.roleName? '，' : ''}` }}</span></span>
        </template>
      </el-table-column>
      <el-table-column
        label="负责场站"
        align="center"
        key="deptName"
        prop="dept.deptName"
        v-if="columns[5].visible"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span v-for="(item,index) in scope.row.regions" :key="index"><span v-if="item">{{ item.name + `${index == scope.row.regions? '，' : ''}` }}</span></span>
          <span v-if="scope.row.regions.length != 0 && scope.row.stations.length != 0">，</span>
          <span v-for="(item,index) in scope.row.stations" :key="index"><span v-if="item">{{ item.name + `${index == scope.row.regions? '，' : ''}` }}</span></span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" /> -->
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[6].visible" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column> -->
      <el-table-column
        label="操作"
        align="center"
        width="260"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope" v-if="scope.row.userId !== 1">
          <el-button
            type="text"
            icon="el-icon-info"
            @click="handleUpdate(scope.row,true)"
            >详情</el-button
          >
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row,false)"
            v-hasPermi="['system:user:edit']"
            >编辑</el-button
          >
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:user:remove']"
            >删除</el-button
          >
          <el-button
            type="text"
            :icon="scope.row.status == 0? 'el-icon-circle-close':'el-icon-circle-check'"
            @click="handleStatusChange(scope.row)"
            v-hasPermi="['system:user:remove']"
            >{{ scope.row.status == 1 ? "启用" : "停用" }}</el-button
          >
          <!-- <el-dropdown @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']">
                <el-button type="text" icon="el-icon-d-arrow-right">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleResetPwd" icon="el-icon-key"
                    v-hasPermi="['system:user:resetPwd']">重置密码</el-dropdown-item>
                  <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check"
                    v-hasPermi="['system:user:edit']">分配角色</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- </el-col>
    </el-row> -->

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" class="dialog" :model="form" :rules="rules" label-width="80px">
        <p class="title">人员信息</p>
        <el-form-item label="姓名" prop="nickName">
          <el-input
            v-model="form.nickName"
            placeholder="请输入用户昵称"
            maxlength="30"
            :disabled="infoDisable"
          />
        </el-form-item>

        <!-- <el-form-item label="归属部门" prop="deptId">
          <treeselect
            v-model="form.deptId"
            :options="deptOptions"
            :show-count="true"
            placeholder="请选择归属部门"
          />
        </el-form-item> -->
        <p class="title">账号权限</p>
        <!-- <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="form.phonenumber"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item> -->

        <!-- <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item> -->

        <el-form-item
          label="手机号码"
          prop="userName"
        >
          <el-input
            v-model="form.userName"
            placeholder="请输入手机号码"
            maxlength="30"
            @keyup="form.phonenumber = form.userName"
            :disabled="infoDisable"
          />
        </el-form-item>

        <el-form-item
          label="用户密码"
          prop="password"
        >
          <!-- <el-input
            v-model="form.password"
            placeholder="请输入用户密码"
            type="password"
            maxlength="20"
            show-password
          /> -->
          初始密码为：<span style="color:red">12345678</span>
          <span style="margin-left: 20px;">登录后系统会自动提示修改密码</span>
        </el-form-item>

        <!-- <el-form-item label="用户性别">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option
              v-for="dict in dict.type.sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item> -->


        <!-- <el-form-item label="岗位">
          <el-select v-model="form.postIds" multiple placeholder="请选择岗位">
            <el-option
              v-for="item in postOptions"
              :key="item.postId"
              :label="item.postName"
              :value="item.postId"
              :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item> -->

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" placeholder="请选择角色" style="width: 100%;" :disabled="infoDisable">
            <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
              :disabled="item.status == 1"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="负责场站" prop="regionIds">
          <treeselect
            v-model="form.regionIds"
            :options="stationOptions"
            :show-count="true"
            :normalizer="normalizer"
            :clearable="false"
            :disabled="infoDisable"
            search-nested
            multiple
            placeholder="请选择父级场站"
          >
          <label slot="option-label" slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }" :class="labelClassName">
            {{ node.raw.regionType == 'REGION'?'场地':'站点' }}: {{ node.label }}
            <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
          </label>
          </treeselect>
        </el-form-item>

        <!-- <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-show="!infoDisable">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />
            是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
            >下载模板</el-link
          >
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  deptTreeSelect,
  regionTreeSelect,
  bandRegionByUser,
  getAuthRole
} from "@/api/system/user";
import { getToken } from "@/utils/auth";
import { mapState } from 'vuex'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "User",
  dicts: ["sys_normal_disable", "sys_user_sex"],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 详情
      infoDisable:false,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      // deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
        regionIds: undefined
      },
      roleList:[],
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `姓名`, visible: true },
        { key: 2, label: `手机号码`, visible: true },
        { key: 3, label: `状态`, visible: true },
        { key: 4, label: `角色`, visible: true },
        { key: 5, label: `负责场站`, visible: true },
      ],

      column: "",

      stationOptions: [],
      normalizer(node) {
        return {
          id: node.value,
          label: node.label,
          regionType: node.regionType,
          children: node.children,
        };
      },

      // 表单校验
      rules: {
        userName: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
        ],
        roleIds:[
          { required: true, message: "角色不能为空", trigger: "blur" },
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed:{
    ...mapState({
      user: state => state.user.user,
    }),
  },
  watch: {
    // 根据名称筛选部门树
    // deptName(val) {
    //   this.$refs.tree.filter(val);
    // }
  },
  created() {
    this.getList();
    this.getDeptTree();
    this.getRegTree()
    this.getRoleList();
    this.getConfigKey("sys.user.initPassword").then((response) => {
      this.initPassword = response.msg;
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    getRegTree(){
      regionTreeSelect().then(res=>{
        this.stationOptions = res.data;
      })
    },
    /* 查询角色 */
    getRoleList(){
      console.log(this.user)
      getAuthRole(this.user.userId).then(res=>{
        console.log(res)
        this.roleList = res.roles
      })
    },
    
    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let status = row.status == 1 ? 0 : 1;
      console.log(status);
      let text = status === "0" ? "启用" : "停用";
      this.$modal
        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
        .then(function () {
          return changeUserStatus(row.userId, status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "成功");
          this.getList();
        })
        .catch(function () {
          status = row.status == 1 ? 0 : 1;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.deptId = undefined;
      // this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.infoDisable = false;
      this.reset();
      getUser().then((response) => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row,type) {
      this.infoDisable = type
      this.reset();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.$set(this.form, "postIds", response.postIds);
        this.$set(this.form, "roleIds", response.roleIds[0]);
        this.$set(this.form, "regionIds", typeof response.regionIds == 'string' ? JSON.parse(response.regionIds) : response.regionIds);
        this.open = true;
        this.title = this.infoDisable ? "用户详情" : "修改用户";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.$modal.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push("/system/user-auth/role/" + userId);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.form.roleIds = this.form.roleIds? [this.form.roleIds] : '';
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              if(this.form.regionIds){
                bandRegionByUser({ids:this.form.regionIds,userId:this.form.userId})
              }
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              if(this.form.regionIds){
                bandRegionByUser({ids:this.form.regionIds,userId:this.form.userId})
              }
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal
        .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/user/export",
        {
          ...this.queryParams,
        },
        `user_${new Date().getTime()}.xlsx`
      );
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download(
        "system/user/importTemplate",
        {},
        `user_template_${new Date().getTime()}.xlsx`
      );
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "导入结果",
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    enableFormat(row) {
      return this.selectDictLabel(
        this.dict.type.sys_normal_disable,
        row.status
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.success::before {
  content: "";
  background: #00a854;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  margin-right: 2px;
}
.error::before {
  content: "";
  background: #ccc;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  margin-right: 2px;
}
.dialog{
  .title{
    padding: 0;
    margin: 0;
    padding-left: 10px;
    margin-bottom: 10px;
    border-left: 5px solid #1990FF;
  }
}
</style>