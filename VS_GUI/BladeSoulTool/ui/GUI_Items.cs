using System;
using System.Data;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using BladeSoulTool.lib;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.ui
{
    public partial class GuiItems : Form
    {

        private int _formType;

        private DataTable _dataTable;

        private JObject _data;

        private string _selectedElementId;
        private string _originElementId;
        private string _targetElementId;

        private Thread _loadingThread;

        private JObject _originSettings;

        private BstI18NLoader _i18N;

        public GuiItems(int formType)
        {
            InitializeComponent();
            this.InitI18N();
            this.Init(formType);
            this.Shown += new EventHandler(GuiItems_Shown); // 页面展示后的事件
        }

        private void InitI18N()
        {
            this._i18N = BstI18NLoader.Instance;
            this.labelRace.Text = this._i18N.LoadI18NValue("GuiItems", "labelRace");
            this.btnView2DOrigin.Text = this._i18N.LoadI18NValue("GuiItems", "btnView2D");
            this.btnView3DOrigin.Text = this._i18N.LoadI18NValue("GuiItems", "btnView3D");
            this.labelOrigin.Text = this._i18N.LoadI18NValue("GuiItems", "labelOrigin");
            this.btnView2DTarget.Text = this._i18N.LoadI18NValue("GuiItems", "btnView2D");
            this.btnView3DTarget.Text = this._i18N.LoadI18NValue("GuiItems", "btnView3D");
            this.labelTarget.Text = this._i18N.LoadI18NValue("GuiItems", "labelTarget");
            this.btnTopRestoreAll.Text = this._i18N.LoadI18NValue("GuiItems", "btnTopRestoreAll");
            this.btnView3DInfo.Text = this._i18N.LoadI18NValue("GuiItems", "btnView3D");
            this.btnSelectTarget.Text = this._i18N.LoadI18NValue("GuiItems", "btnSelectTarget");
            this.btnSelectOrigin.Text = this._i18N.LoadI18NValue("GuiItems", "btnSelectOrigin");
            this.labelInfoHead.Text = this._i18N.LoadI18NValue("GuiItems", "labelInfoHead");
            this.btnReplace.Text = this._i18N.LoadI18NValue("GuiItems", "btnReplace");
            this.labelRestore.Text = this._i18N.LoadI18NValue("GuiItems", "labelRestore");
            this.labelFilter.Text = this._i18N.LoadI18NValue("GuiItems", "labelFilter");
            this.btnFilter.Text = this._i18N.LoadI18NValue("GuiItems", "btnFilter");
        }

        private void Init(int formType)
        {
            this._formType = formType;
            this._originSettings = BstManager.ReadJsonFile(BstManager.GetItemOriginJsonPath(this._formType));
            // 数据列表
            this._dataTable = new DataTable();
            // icon列
            var columnIcon = new DataColumn("Icon")
            {
                DataType = Type.GetType("System.Byte[]"),
                AllowDBNull = true,
                ColumnName = this._i18N.LoadI18NValue("GuiItems", "tableColIcon")
            };
            //columnIcon.ReadOnly = true;
            this._dataTable.Columns.Add(columnIcon);
            // code列
            var columnCode = new DataColumn("Code") {
                ColumnName = this._i18N.LoadI18NValue("GuiItems", "tableColCode"),
                ReadOnly = true
            };
            this._dataTable.Columns.Add(columnCode);

            // 数据展示列表
            this.gridItems.DataSource = this._dataTable;
            this.gridItems.RowTemplate.Height = 64;
            // icon列
            var gridColumnIcon = this.gridItems.Columns[0];
            gridColumnIcon.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnIcon.Width = 64;
            // 展示列表点击事件
            this.gridItems.CellClick += new DataGridViewCellEventHandler(this.gridItems_CellClick);
            // 展示列表鼠标滚轴事件
            this.gridItems.MouseWheel += new MouseEventHandler(this.gridItems_MouseWheel);

            // 种族选择控件
            // ReSharper disable once CoVariantArrayConversion
            this.comboBoxRace.Items.AddRange(BstManager.Instance.RaceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;
            this.comboBoxRace.SelectedIndexChanged += new EventHandler(this.comboBoxRace_SelectedIndexChanged);

            // 查找模型控件
            this.btnFilter.Click += new EventHandler(this.btnFilter_Click);

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

        private void GuiItems_Shown(object sender, EventArgs e)
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
                BstManager.ShowMsgInTextBox(this.textBoxOut, this._i18N.LoadI18NValue("GuiItems", "logStartToLoadDataList"));

                BstManager.HideDataGridViewVerticalScrollBar(this.gridItems); // 隐藏滚动条

                // 更新原始模型区块数据
                JObject originData = null;
                if (this._formType == BstManager.TypeAttach
                    || this._formType == BstManager.TypeCostume)
                {
                    var race = BstManager.Instance.RaceTypes[raceType];
                    var data = (JObject) this._originSettings[race];
                    if (data != null)
                    {
                        this._originElementId = (string) data["id"];
                        originData = (JObject) data["data"];
                    }
                }
                else
                {
                    if (this._originSettings["id"] != null)
                    {
                        this._originElementId = (string) this._originSettings["id"];
                        originData = (JObject) this._originSettings["data"];
                    }
                }
                if (originData != null)
                {
                    this.LoadOriginAndTargetIconPic(this.pictureBoxOrigin, originData, true);
                    BstManager.ShowMsgInTextBox(this.textBoxOrigin, originData.ToString(), false);
                }

                // 初始化list数据
                switch (this._formType)
                {
                    case BstManager.TypeCostume:
                        this._data = BstManager.Instance.GetCostumeDataByRace(raceType);
                        break;
                    case BstManager.TypeAttach:
                        this._data = BstManager.Instance.GetAttachDataByRace(raceType);
                        break;
                    case BstManager.TypeWeapon:
                        this._data = BstManager.Instance.DataWeapon;
                        break;
                }
                // 加载list界面
                foreach (var element in this._data.Properties())
                {
                    // 读取数据
                    var elementId = element.Name;
                    var elementData = (JObject) element.Value;
                    // 填充数据
                    // 这里暂时不考虑做成动态的gif动画，考虑到列表里的项可能比较多，那么多timer更新gif动态图可能造成性能问题
                    this._dataTable.Rows.Add(new object[] { BstManager.Instance.LoadingGifBytes, elementId }); 
                    var rowId = this._dataTable.Rows.Count - 1;
                    BstIconLoader.Instance.RegisterTask(new BstIconLoadTask(
                        elementData, this.gridItems, this._dataTable, rowId, this.textBoxOut
                    ));
                }

                BstManager.ShowMsgInTextBox(this.textBoxOut, this._i18N.LoadI18NValue("GuiItems", "logEndLoadDataList"));
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
            this._selectedElementId = (string) this.gridItems.Rows[e.RowIndex].Cells[1].Value;
            var elementData = (JObject) this._data[this._selectedElementId];
            this.textBoxInfo.Text = elementData.ToString();
            // 模型截图控件
            BstPicLoader.LoadPic(this._formType, elementData, pictureBoxUmodel, this.textBoxOut);
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

        private void btnFilter_Click(Object sender, EventArgs e)
        {
            // 查找模型
            var targetModelCode = this.textBoxFilter.Text;
            if (String.IsNullOrEmpty(targetModelCode))
            {
                return; // 查找字符串未空，忽略
            }

            // 决定开始查找行，查找行为只会顺序向下查找，不会回归到第一行
            var startRowIndex = 0;
            if (this.gridItems.SelectedRows.Count > 0) // 如果有选中的行，则从选中那行之后开始查找
            {
                Console.WriteLine("Has selected items ...");
                startRowIndex = this.gridItems.SelectedRows[0].Index + 1;
                if (startRowIndex > this.gridItems.RowCount - 1)
                {
                    startRowIndex = this.gridItems.RowCount - 1;
                }
            }

            for (var i = startRowIndex; i < this.gridItems.RowCount - 1; i++)
            {
                var elementId = (string) this.gridItems.Rows[i].Cells[1].Value;
                var elementData = (JObject) this._data[elementId];
                var core = (string) elementData["core"];
                if (System.Text.RegularExpressions.Regex.IsMatch(core, targetModelCode))
                {
                    // 数据展示列表的点击事件
                    this.gridItems.Rows[i].Selected = true;
                    this.gridItems.Refresh();
                    // 更新查找到的内容对应的数据
                    this._selectedElementId = elementId;
                    this.textBoxInfo.Text = elementData.ToString();
                    // 模型截图控件
                    BstPicLoader.LoadPic(this._formType, elementData, pictureBoxUmodel, this.textBoxOut);
                    // 更新列表展示位置
                    this.gridItems.FirstDisplayedScrollingRowIndex = i;
                    break;
                }
            }
        }

        private void btnTopRestoreAll_Click(Object sender, EventArgs e)
        {
            // 恢复全部模型
            if (BstManager.DisplayConfirmMessageBox(
                this._i18N.LoadI18NValue("GuiItems", "actionConfirmTitle"),
                this._i18N.LoadI18NValue("GuiItems", "actionRestoreMsg")) == DialogResult.OK)
            {
                BstManager.Instance.RunGrunt(this.textBoxOut, "restore");
            }
        }

        private void btnView2DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型2D截图
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectOriginErrorMsg")
                );
                return;
            }
            this.CreatePictureForm(this._originElementId);
        }

        private void btnView3DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型的3D模型
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectOriginErrorMsg")
                );
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._originElementId
            });
        }

        private void btnView2DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型2D截图
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectTargetErrorMsg")
                );
                return;
            }
            this.CreatePictureForm(this._targetElementId);
        }

        private void btnView3DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型的3D模型
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectTargetErrorMsg")
                );
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._targetElementId
            });
        }

        private void btnReplace_Click(Object sender, EventArgs e)
        {
            // 替换模型
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionReplaceErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionOriginEmptyErrorMsg")
                );
                return;
            }
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionReplaceErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionTargetEmptyErrorMsg")
                );
                return;
            }
            if (this._originElementId == this._targetElementId)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionReplaceErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionTargetSameErrorMsg")
                );
                return;
            }
            if (this._formType == BstManager.TypeWeapon) // 只有武器不可替换
            {
                // FIXME 后续制作功能，并开发这个限制
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionFuncNotDoneTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionWaitForFuncMsg")
                );
                return;
            }
            if (BstManager.DisplayConfirmMessageBox(
                this._i18N.LoadI18NValue("GuiItems", "actionConfirmTitle"),
                this._i18N.LoadI18NValue("GuiItems", "actionReplaceMsg")) == DialogResult.OK)
            {
                string race = null;
                if (this._formType == BstManager.TypeAttach
                    || this._formType == BstManager.TypeCostume)
                {
                    race = BstManager.Instance.RaceTypes[this.comboBoxRace.SelectedIndex];
                }
                BstManager.Instance.RunGrunt(this.textBoxOut, "replace", new string[]
                {
                    "--part=" + BstManager.GetTypeName(this._formType),
                    "--model=" + this._targetElementId,
                    "--race=" + race
                });
            }
        }

        private void btnView3DInfo_Click(Object sender, EventArgs e)
        {
            // 预览选中的对象的3D模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectTargetErrorMsg")
                );
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._selectedElementId
            });
        }

        private void btnSelectOrigin_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为原始模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectTargetErrorMsg")
                );
                return; // 没有选中的元素，直接退出
            }
            var element = (JObject) this._data[this._selectedElementId];
            // 只有col1的模型才可以被设为原始模型
            var col = (string) element["col"];
            if (col != "col1")
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionOnlyCol1DataMsg")
                );
                return;
            }
            this._originElementId = this._selectedElementId;
            // 展示icon，该icon应该已经有本地缓存，直接读取本地缓存
            this.LoadOriginAndTargetIconPic(this.pictureBoxOrigin, element);
            // 显示模型数据
            this.textBoxOrigin.Text = element.ToString();
            // 存储原始模型数据
            var originData = new JObject();
            originData["id"] = this._originElementId;
            originData["data"] = element;
            if (this._formType == BstManager.TypeAttach
                || this._formType == BstManager.TypeCostume)
            {
                this._originSettings[(string) element["race"]] = originData;
            }
            else
            {
                this._originSettings = originData;
            }
            BstManager.WriteJsonFile(BstManager.GetItemOriginJsonPath(this._formType), this._originSettings);
        }

        private void btnSelectTarget_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为目标模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox(
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectErrorTitle"),
                    this._i18N.LoadI18NValue("GuiItems", "actionSelectTargetErrorMsg")
                );
                return; // 没有选中的元素，直接退出
            }
            this._targetElementId = this._selectedElementId;
            var element = (JObject) this._data[this._selectedElementId];
            // 展示icon，该icon应该已经有本地缓存，直接读取本地缓存
            this.LoadOriginAndTargetIconPic(this.pictureBoxTarget, element);
            // 显示模型数据
            this.textBoxTarget.Text = element.ToString();
        }

        private void CreatePictureForm(string elementId)
        {
            // 创建一个新的form来展示物件的2D截图
            var pictureForm = new GuiPicture(this._formType, elementId, this.textBoxOut);
            pictureForm.ShowDialog();
        }

        private void LoadOriginAndTargetIconPic(PictureBox picture, JObject elementData, bool async = false)
        {
            var cachePath = BstManager.GetIconPicTmpPath(elementData);
            if (async)
            {
                MethodInvoker picUpdate = delegate
                {
                    if (File.Exists(cachePath))
                    {
                        picture.ImageLocation = cachePath;
                    }
                    else
                    {
                        picture.ImageLocation = BstManager.GetIconPicUrl(elementData);
                    }
                    picture.Load();
                };
                picture.BeginInvoke(picUpdate);
            }
            else
            {
                if (File.Exists(cachePath))
                {
                    picture.ImageLocation = cachePath;
                }
                else
                {
                    picture.ImageLocation = BstManager.GetIconPicUrl(elementData);
                }
                picture.Load();
            }
        }

    }
}
