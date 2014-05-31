using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace BladeSoulTool
{
    /**
     * 几个问题:
     * 当前程序在VS的debug模式下运行正常，但是在非debug模式下直接卡死，需要在别的机器上测试是否有相同问题，网上查询有部分说是.NET的问题
     * http://stackoverflow.com/questions/738327/c-sharp-app-runs-with-debugging-but-not-without
     * 在种族选择tab切换的时候，界面完全卡死，要寻找理由
     * 此外，在读取本地缓存文件的时候，界面反而卡死，估计是过于频繁的DataGridView.Refresh()调用
     * 所有的picturebox的图片加载都需要更新，GUI PICTURE
     * 顶部的两个icon picture box，也需要更新
     * 图片加载的几个路径，和几个工具函数的调用，都比较麻烦，最好重构下
     * picturebox里的gif动画，没有播放，还要居中
     */
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

        private readonly Queue<BstIconLoadTask> _queue;
        private Thread _iconLoaderThread;

        private BstIconLoader()
        {
            this._queue = new Queue<BstIconLoadTask>();
        }

        public void Run()
        {
            var isAnyTaskLeft = true;
            while (isAnyTaskLeft)
            {
                var task = this._queue.Dequeue();

                // 加载图片
                byte[] pic = null;
                var imgCachePath = BstManager.PathVsRoot + BstManager.PathVsTmp + "icon/" + task.Name;
                if (File.Exists(imgCachePath))
                {
                    // 已有缓存文件
                    pic = BstManager.GetBytesFromFile(imgCachePath);
                }
                else
                {
                    // 没有缓存文件，需要下载
                    pic = BstManager.DownloadImageFile(task.Url, imgCachePath);
                }
                if (pic == null)
                {
                    MethodInvoker msgFailedAction = () => task.Box.AppendText("图片下载失败：" + task.Url + "\r\n");
                    task.Box.BeginInvoke(msgFailedAction);
                    BstLogger.Instance.Log("[BstIconLoader] Pic download failed: " + task.Url);
                    continue;
                }

                // 更新图片
                task.Table.Rows[task.RowId][task.ColId] = pic;
                MethodInvoker tableUpdateAction = () => task.Grid.Refresh();
                task.Grid.BeginInvoke(tableUpdateAction);
                MethodInvoker msgDownloadedAction = () => task.Box.AppendText("图片下载完成：" + task.Url + "\r\n");
                task.Box.BeginInvoke(msgDownloadedAction);
                BstLogger.Instance.Log("[BstIconLoader] Pic downloaded: " + task.Url);

                if (this._queue.Count != 0) continue; // 仍旧还有工作未完成，继续
                // 当前工作队列已清空，设置关闭状态
                MethodInvoker msgDoneAction = () => task.Box.AppendText("所有图片下载任务完成 ...\r\n");
                task.Box.BeginInvoke(msgDoneAction);
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
            if (this._iconLoaderThread.IsAlive)
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
