using System;
using System.ComponentModel;
using System.Data;
using System.Windows.Forms;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{
    public partial class GUI_Items : Form
    {

        private int _formType;

        private BackgroundWorker _loader;

        private DataTable _dataTable;

        private JObject _data;

        private string _selectedElementId;
        private string _originElementId;
        private string _targetElementId;

        public GUI_Items(int formType)
        {
            InitializeComponent();
            this.Shown += new EventHandler(GUI_Items_Shown); // 页面展示后的事件
            this.init(formType);
        }

        private void init(int formType)
        {
            this._formType = formType;
            // 数据列表
            this._dataTable = new DataTable();
            // icon列
            var columnIcon = new DataColumn("Icon")
            {
                DataType = System.Type.GetType("System.Byte[]"),
                AllowDBNull = true,
                ColumnName = "缩略图"
            };
            //columnIcon.ReadOnly = true;
            this._dataTable.Columns.Add(columnIcon);
            // code列
            var columnCode = new DataColumn("Code") {ColumnName = "编号", ReadOnly = true};
            this._dataTable.Columns.Add(columnCode);

            // 数据展示列表
            this.gridItems.DataSource = this._dataTable;
            this.gridItems.RowTemplate.Height = 64;
            // icon列
            var gridColumnIcon = this.gridItems.Columns[0];
            gridColumnIcon.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnIcon.Width = 64;
            // 展示列表点击事件
            this.gridItems.CellClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.gridItems_CellClick);
            // 展示列表鼠标滚轴事件
            this.gridItems.MouseWheel += new MouseEventHandler(this.gridItems_MouseWheel);

            // 种族选择控件
            this.comboBoxRace.Items.AddRange(BstManager.Instance.RaceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;
            this.comboBoxRace.SelectedIndexChanged +=new EventHandler(this.comboBoxRace_SelectedIndexChanged);

            // 全部恢复按钮
            this.btnTopRestoreAll.Click += new EventHandler(this.btnTopRestoreAll_Click);
            // 预览原始模型2D截图
            this.btnView2DOrigin.Click += new EventHandler(this.btnView2DOrigin_Click);
            // 预览原始模型3D模型
            this.btnView3DOrigin.Click += new EventHandler(this.btnView3DOrigin_Click);
            // 预览目标模型2D截图
            this.btnView2DTarget.Click += new EventHandler(this.btnView2DTarget_Click);
            // 预览目标模型3D模型
            this.btnView3DTarget.Click += new EventHandler(this.btnView3DTarget_Click);
            // 替换按钮
            this.btnReplace.Click += new EventHandler(this.btnReplace_Click);

            // 展示选中物件的3D模型按钮
            this.btnView3DInfo.Click += new EventHandler(this.btnView3DInfo_Click);
            // 选为原始模型按钮
            this.btnSelectOrigin.Click += new EventHandler(this.btnSelectOrigin_Click);
            // 选为目标模型按钮
            this.btnSelectTarget.Click += new EventHandler(this.btnSelectTarget_Click);
        }

        private void GUI_Items_Shown(object sender, EventArgs e)
        {
            // 当UI加载完毕开始显示之后才开始加载数据
            this.LoadItemList();
        }

        private void LoadItemList(int raceType = BstManager.RaceIdKunn)
        {
            BstLogger.Instance.Log("[GUI_Items] Start to load item list: " + raceType);
            this._loader = new BackgroundWorker();
            this._loader.DoWork += new DoWorkEventHandler(this.loader_DoWork);
            this._loader.RunWorkerCompleted += new RunWorkerCompletedEventHandler(this.loader_RunWorkerCompleted);
            this._loader.RunWorkerAsync(raceType);
        }

        private void loader_DoWork(object sender, DoWorkEventArgs e)
        {
            // 在background worker里加载数据
            MethodInvoker action = () => this.textBoxOut.AppendText("开始加载数据列表数据 ... \r\n");
            this.textBoxOut.BeginInvoke(action);
            BstLogger.Instance.Log("开始加载数据列表数据 ...");
            // 按form类型做各自的逻辑处理
            var raceType = (int) e.Argument;
            this.InitListData(raceType);
        }

        private void loader_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            // 数据加载完成
            MethodInvoker action = () => this.textBoxOut.AppendText("数据列表加载完成，开始加载图片 ...\r\n");
            this.textBoxOut.BeginInvoke(action);
            BstLogger.Instance.Log("数据列表加载完成，开始加载图片 ...");
            MethodInvoker gridAction = () => this.gridItems.PerformLayout(); // 刷新scrollbar
            this.gridItems.BeginInvoke(gridAction);
            BstIconLoader.Instance.Start(); // 启动图片加载器
            this._loader.Dispose();
        }

        private void ClearFormStatus()
        {
            // 重置form的状态
            this._selectedElementId = null;
            this._originElementId = null;
            this._targetElementId = null;

            this.textBoxInfo.Text = null;
            this.textBoxOrigin.Text = null;
            this.textBoxTarget.Text = null;
            this.textBoxOut.Text = null;

            this.pictureBoxOrigin.Image = null;
            this.pictureBoxTarget.Image = null;
            this.pictureBoxUmodel.Image = null;

            this._data = null;
            this._dataTable.Clear();
        }

        private void gridItems_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0 || e.RowIndex > (this.gridItems.RowCount - 1))
            {
                return; // 索引越界
            }
            // 数据展示列表的点击事件
            this.gridItems.Rows[e.RowIndex].Selected = true;
            this.gridItems.Refresh();
            // 查找该行对应的数据
            this._selectedElementId = (string)this.gridItems.Rows[e.RowIndex].Cells[1].Value;
            this.textBoxInfo.Text = this._data[this._selectedElementId].ToString();
            // 模型截图控件
            this.pictureBoxUmodel.ImageLocation = BstManager.GetItemPicPath(this._formType, this._selectedElementId);
        }

        private void gridItems_MouseWheel(Object sender, MouseEventArgs e)
        {
            // 数据展示列表的鼠标滚轴事件
            var currentIndex = this.gridItems.FirstDisplayedScrollingRowIndex;
            var scrollLines = SystemInformation.MouseWheelScrollLines;

            if (e.Delta > 0)
            {
                this.gridItems.FirstDisplayedScrollingRowIndex = Math.Max(0, currentIndex - scrollLines);
            }
            else if (e.Delta < 0)
            {
                this.gridItems.FirstDisplayedScrollingRowIndex = currentIndex + scrollLines;
            }
        }

        private void comboBoxRace_SelectedIndexChanged(Object sender, EventArgs e)
        {
            // 重新选择种族信息
            this.ClearFormStatus();
            this.LoadItemList(this.comboBoxRace.SelectedIndex);
        }

        private void btnTopRestoreAll_Click(Object sender, EventArgs e)
        {
            // 恢复全部模型
            BstLogger.Instance.Log("btnTopRestoreAll_Click");
        }

        private void btnView2DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型2D截图
            if (this._originElementId == null)
            {
                return;
            }
            this.CreatePictureForm(this._originElementId);
        }

        private void btnView3DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型的3D模型
            BstLogger.Instance.Log("btnView3DOrigin_Click");
        }

        private void btnView2DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型2D截图
            if (this._targetElementId == null)
            {
                return;
            }
            this.CreatePictureForm(this._targetElementId);
        }

        private void btnView3DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型的3D模型
            BstLogger.Instance.Log("btnView3DTarget_Click");
        }

        private void btnReplace_Click(Object sender, EventArgs e)
        {
            // 替换模型
            BstLogger.Instance.Log("btnReplace_Click");
            BstManager.RunGrunt(this.textBoxOut);
        }

        private void btnView3DInfo_Click(Object sender, EventArgs e)
        {
            // 预览选中的对象的3D模型
            BstLogger.Instance.Log("btnView3DInfo_Click");
        }

        private void btnSelectOrigin_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为原始模型
            if (this._selectedElementId == null) 
            {
                return; // 没有选中的元素，直接退出
            }
            var element = (JObject)this._data[this._selectedElementId];
            // 只有col1的模型才可以被设为原始模型
            var col = (string)element["col"];
            if (col != "col1")
            {
                MessageBox.Show("只可将后缀最后为col1的模型设为原始模型", "选择错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            this._originElementId = this._selectedElementId;
            // 展示icon
            this.pictureBoxOrigin.ImageLocation = BstManager.GetIconPicPath(element);
            this.pictureBoxOrigin.Load();
            // 显示模型数据
            this.textBoxOrigin.Text = element.ToString();
            // TODO 将选择好的原始模型数据写入到文件
        }

        private void btnSelectTarget_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为目标模型
            if (this._selectedElementId == null) 
            {
                return; // 没有选中的元素，直接退出
            }
            this._targetElementId = this._selectedElementId;
            JObject element = (JObject)this._data[this._selectedElementId];
            // 展示icon
            this.pictureBoxTarget.ImageLocation = BstManager.GetIconPicPath(element);
            this.pictureBoxTarget.Load();
            // 显示模型数据
            this.textBoxTarget.Text = element.ToString();
        }

        public void InitListData(int raceType = BstManager.RaceIdKunn)
        {
            // 首先关闭pic loader，防止多线程不安全的操作
            BstIconLoader.Instance.Stop();
            // TODO 原始模型目标应该会被保存在磁盘上的某个配置文件内，这里需要读出
            // 并设置到 this.originElementId里，还要更新整个原始模型的cell控件
            // 初始化list数据
            switch (this._formType)
            {
                case App.FormTypeCostume:
                    this._data = BstManager.Instance.GetCostumeDataByRace(raceType);
                    break;
                case App.FormTypeAttach:
                    this._data = BstManager.Instance.GetAttachDataByRace(raceType);
                    break;
                case App.FormTypeWeapon:
                    this._data = BstManager.Instance.WeaponData;
                    break;
                default:
                    break;
            }
            // 加载list界面
            foreach (var element in this._data.Properties())
            {
                // 读取数据
                var elementId = element.Name;
                var elementData = (JObject)element.Value;
                // 填充数据
                this._dataTable.Rows.Add(new object[] { BstManager.Instance.LoadingGif, elementId });
                var rowId = this._dataTable.Rows.Count - 1;
                BstIconLoader.Instance.RegisterTask(new BstIconLoadTask(
                    BstManager.GetIconPicPath(elementData), (string)elementData["pic"],
                    this.gridItems, this._dataTable, rowId, this.textBoxOut
                ));
            }
        }

        private void CreatePictureForm(string elementId)
        {
            // 创建一个新的form来展示物件的2D截图
            var imgPath = BstManager.GetItemPicPath(this._formType, elementId);
            var pictureForm = new BladeSoulTool.ui.GUI_Picture(imgPath);
            pictureForm.Show();
        }

    }
}
