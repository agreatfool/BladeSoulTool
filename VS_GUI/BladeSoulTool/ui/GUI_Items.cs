using System;
using System.ComponentModel;
using System.Data;
using System.Threading;
using System.Windows.Forms;
using BladeSoulTool.lib;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.ui
{
    public partial class GuiItems : Form
    {

        private int _formType;

        private BackgroundWorker _loader;

        private DataTable _dataTable;

        private JObject _data;

        private string _selectedElementId;
        private string _originElementId;
        private string _targetElementId;

        private Thread _loadingThread;

        public GuiItems(int formType)
        {
            InitializeComponent();
            this.Shown += new EventHandler(GUI_Items_Shown); // 页面展示后的事件
            this.Init(formType);
        }

        private void Init(int formType)
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
            if (this._loadingThread != null && this._loadingThread.IsAlive)
            {
                // 之前启动的加载线程还活着，需要先停止
                try
                {
                    this._loadingThread.Abort();
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
                this._loadingThread = null;
            }

            this.ClearFormStatus(); // 清理旧的数据

            // 启动新的线程来处理数据加载内容
            this._loadingThread = new Thread(() =>
            {
                MethodInvoker startAction = () => this.textBoxOut.AppendText("开始加载数据列表数据 ... \r\n");
                this.textBoxOut.BeginInvoke(startAction);
                BstLogger.Instance.Log("开始加载数据列表数据 ...");

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
                        BstManager.GetIconPicUrl(elementData), (string)elementData["pic"],
                        this.gridItems, this._dataTable, rowId, this.textBoxOut
                    ));
                }

                MethodInvoker finishAction = () => this.textBoxOut.AppendText("数据列表加载完成，开始加载图片 ...\r\n");
                this.textBoxOut.BeginInvoke(finishAction);
                BstLogger.Instance.Log("数据列表加载完成，开始加载图片 ...");
                MethodInvoker gridAction = () => this.gridItems.PerformLayout(); // 刷新scrollbar
                this.gridItems.BeginInvoke(gridAction);
                BstIconLoader.Instance.Start(); // 启动图片加载器
            });
            this._loadingThread.Start();
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

            // 清空之前的加载队列，准备重新填充加载内容
            BstIconLoader.Instance.Stop();
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
            BstPicLoader.LoadPic(
                BstManager.GetItemPicUrl(this._formType, this._selectedElementId),
                this._selectedElementId + ".png",
                BstManager.PathVsRoot + BstManager.PathVsTmp + BstManager.GetTypeName(this._formType) + "/" + this._selectedElementId + ".png",
                this.pictureBoxUmodel,
                this.textBoxOut
            );
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
            // 重新选择种族，即重新加载界面
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
            BstManager.Instance.RunGrunt(this.textBoxOut);
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
            this.pictureBoxOrigin.ImageLocation = BstManager.GetIconPicUrl(element);
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
            this.pictureBoxTarget.ImageLocation = BstManager.GetIconPicUrl(element);
            this.pictureBoxTarget.Load();
            // 显示模型数据
            this.textBoxTarget.Text = element.ToString();
        }

        private void CreatePictureForm(string elementId)
        {
            // 创建一个新的form来展示物件的2D截图
            var pictureForm = new GuiPicture(this._formType, elementId, this.textBoxOut);
            pictureForm.ShowDialog();
        }

    }
}
