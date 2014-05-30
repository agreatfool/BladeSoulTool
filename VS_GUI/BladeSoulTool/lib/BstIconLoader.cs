using System.Collections.Generic;
using System.Threading;
using System.Windows.Forms;

namespace BladeSoulTool
{
    /**
     * 几个问题:
     * 01. 当前程序在VS的debug模式下运行正常，但是在非debug模式下直接卡死，需要在别的机器上测试是否有相同问题，网上查询有部分说是.NET的问题
     * http://stackoverflow.com/questions/738327/c-sharp-app-runs-with-debugging-but-not-without
     * 04. picturebox的图片加载也应该使用这种lazy的方法
     * 05. 加载下来的图片最好是下载，放到缓存文件夹里，以后重新打开程序时候的加载速度就可以快很多
     */
    class BstIconLoader
    {
        private static BstIconLoader instance;

        public static BstIconLoader Instance 
        {
            get 
            {
                if (instance == null) 
                {
                    instance = new BstIconLoader();
                }
                return instance;
            }
        }

        private bool enabled = false; // loader当前是否处于启动状态
        private bool isWorking = false; // loader当前是否正在工作
        private readonly Queue<BstIconLoadTask> queue;
        private Thread picLoaderThread;

        private BstIconLoader()
        {
            this.queue = new Queue<BstIconLoadTask>();
            this.picLoaderThread = new Thread(this.Run) { IsBackground = true };
            this.picLoaderThread.Start();
        }

        public void Run()
        {
            try
            {
                while (true)
                {
                    if (this.enabled // loader处于启动状态
                        && this.queue.Count != 0 // loader的工作列表有内容
                        && !this.isWorking) // 当前loader并未在处理任何工作
                    {
                        this.isWorking = true;
                        var task = this.queue.Dequeue();

                        // 加载图片
                        var pic = BstManager.DownloadImageFile(task.url, BstManager.PathVsRoot + BstManager.PathVsTmp + "icon/" + task.name);
                        if (pic == null)
                        {
                            MethodInvoker msgFailedAction = () => task.box.AppendText("图片下载失败：" + task.url + "\r\n");
                            task.box.BeginInvoke(msgFailedAction);
                            BstLogger.Instance.Log("[BstIconLoader] Pic download failed: " + task.url);
                            this.isWorking = false;
                            continue;
                        }

                        // 更新图片
                        task.table.Rows[task.rowId][task.colId] = pic;
                        MethodInvoker tableUpdateAction = () => task.grid.Refresh();
                        task.grid.BeginInvoke(tableUpdateAction);
                        MethodInvoker msgDownloadedAction = () => task.box.AppendText("图片下载完成：" + task.url + "\r\n");
                        task.box.BeginInvoke(msgDownloadedAction);
                        BstLogger.Instance.Log("[BstIconLoader] Pic downloaded: " + task.url);
                        this.isWorking = false;

                        if (this.queue.Count != 0) continue; // 这是当前工作队列中的最后一个工作，完成后关闭启动状态，等待下次添加工作后手动启动
                        MethodInvoker msgDoneAction = () => task.box.AppendText("所有图片下载任务完成 ...\r\n");
                        task.box.BeginInvoke(msgDoneAction);
                        BstLogger.Instance.Log("[BstIconLoader] Queued works all done ...");
                        this.enabled = false;
                    }
                    else if (this.queue.Count == 0 && !this.isWorking) // 当队列为空，且当前没有工作要处理的时候，睡眠
                    {
                        BstLogger.Instance.Log("[BstIconLoader] No working to do, sleep 1000ms ...");
                        Thread.Sleep(1000); // 1000ms
                    }
                }
            }
            catch (ThreadAbortException tae)
            {
                BstLogger.Instance.Log(tae.ToString());
            }
        }

        public void RegisterTask(BstIconLoadTask task)
        {
            this.queue.Enqueue(task);
        }

        public void Start()
        {
            this.enabled = true; // 将loader的状态置为工作
        }

        public void Stop()
        {
            this.enabled = false; // 将loader的状态置为暂停
        }
    }
}
