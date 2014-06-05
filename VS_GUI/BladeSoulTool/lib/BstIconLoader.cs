using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace BladeSoulTool.lib
{
    class BstIconLoader
    {
        private static BstIconLoader _instance;

        public static BstIconLoader Instance
        {
            get 
            {
                if (_instance == null)
                {
                    _instance = new BstIconLoader();
                }
                return _instance;
            }
        }

        private const int UpdateThrottle = 30; // 在下载|读取多少张icon图片之后刷新UI，频率过快的刷新会卡死主界面

        private readonly Queue<BstIconLoadTask> _queue;
        private Thread _iconLoaderThread;

        private BstIconLoader()
        {
            this._queue = new Queue<BstIconLoadTask>();
        }

        public void Run()
        {
            var updatedCount = 0;
            var isAnyTaskLeft = true;
            while (isAnyTaskLeft)
            {
                var task = this._queue.Dequeue();

                // 加载图片
                byte[] pic = null;
                var downloadUrl = BstManager.GetIconPicUrl(task.ElementData);
                var imgCachePath = BstManager.GetIconPicTmpPath(task.ElementData);
                if (File.Exists(imgCachePath))
                {
                    // 已有缓存文件
                    pic = BstManager.GetBytesFromFile(imgCachePath);
                }
                else
                {
                    // 没有缓存文件，需要下载
                    pic = BstManager.DownloadImageFile(downloadUrl, imgCachePath);
                }

                // 检查结果并更新UI
                if (pic == null)
                {
                    BstManager.ShowMsgInTextBox(task.Box, "图片下载失败：" + downloadUrl);
                }
                else
                {
                    BstManager.ShowMsgInTextBox(task.Box, "图片下载完成：" + downloadUrl);

                    // 更新图片
                    task.Table.Rows[task.RowId][task.ColId] = pic;
                    updatedCount++;
                    if (updatedCount >= BstIconLoader.UpdateThrottle)
                    {
                        MethodInvoker tableUpdateAction = () => task.Grid.Refresh();
                        task.Grid.BeginInvoke(tableUpdateAction);
                        updatedCount = 0;
                    }
                }

                if (this._queue.Count != 0) continue; // 仍旧还有工作未完成，继续轮询

                // 当前工作队列已清空，最后更新UI，设置关闭状态
                MethodInvoker tableFinalUpdateAction = () => task.Grid.Refresh();
                task.Grid.BeginInvoke(tableFinalUpdateAction);
                BstManager.ShowMsgInTextBox(task.Box, "所有图片下载任务完成 ...");
                BstLogger.Instance.Log("[BstIconLoader] Queued works all done, thread exit ...");
                isAnyTaskLeft = false;
            }
        }

        public void RegisterTask(BstIconLoadTask task)
        {
            this._queue.Enqueue(task);
        }

        public void Start()
        {
            this._iconLoaderThread = new Thread(this.Run) { IsBackground = true };
            this._iconLoaderThread.Start();
        }

        public void Stop()
        {
            this._queue.Clear();
            if (this._iconLoaderThread != null && this._iconLoaderThread.IsAlive)
            {
                try
                {
                    this._iconLoaderThread.Abort(); // 如果线程正在工作的话，强制退出
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
            }
            this._iconLoaderThread = null;
        }
    }
}
