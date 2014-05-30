using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.ComponentModel;
using System.Threading;
using System.Data;
using System.Windows.Forms;

namespace BladeSoulTool
{
    /**
     * 几个问题:
     * 01. 当前程序在VS的debug模式下运行正常，但是在非debug模式下直接卡死，需要在别的机器上测试是否有相同问题，网上查询有部分说是.NET的问题
     * http://stackoverflow.com/questions/738327/c-sharp-app-runs-with-debugging-but-not-without
     * 03. datatable的图片栏，gif动画没有播放，是静态的
     * 04. picturebox的图片加载也应该使用这种lazy的方法
     * 05. 加载下来的图片最好是下载，放到缓存文件夹里，以后重新打开程序时候的加载速度就可以快很多
     */
    class BstPicLoader
    {
        private static BstPicLoader instance;

        public static BstPicLoader Instance 
        {
            get 
            {
                if (instance == null) 
                {
                    instance = new BstPicLoader();
                }
                return instance;
            }
        }

        private bool enabled = false; // loader当前是否处于启动状态
        private bool isWorking = false; // loader当前是否正在工作
        private Queue<BstPicLoadTask> queue;
        private Thread picLoaderThread;

        private BstPicLoader()
        {
            this.queue = new Queue<BstPicLoadTask>();
            this.picLoaderThread = new Thread(this.run);
            picLoaderThread.IsBackground = true;
            picLoaderThread.Start();
        }

        public void run()
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
                        BstPicLoadTask task = this.queue.Dequeue();
                        // 加载图片
                        byte[] pic = BstManager.getBytesFromWeb(task.url);
                        // 更新图片
                        task.table.Rows[task.rowId][task.colId] = pic;
                        MethodInvoker updateAction = () => task.grid.Refresh();
                        task.grid.BeginInvoke(updateAction);
                        Console.WriteLine("[BstPicLoader] Pic downloaded: " + task.url);
                        this.isWorking = false;
                    }
                    else if (this.queue.Count == 0 && !this.isWorking) // 当队列为空，且当前没有工作要处理的时候，睡眠
                    {
                        Console.WriteLine("[BstPicLoader] No working to do, sleep 1000ms ...");
                        Thread.Sleep(1000); // 1000ms
                    }
                }
            }
            catch (ThreadAbortException tae)
            {
                //Console.WriteLine(tae);
            }
        }

        public void registerTask(BstPicLoadTask task)
        {
            this.queue.Enqueue(task);
        }

        public void start()
        {
            this.enabled = true; // 将loader的状态置为工作
        }

        public void stop()
        {
            this.enabled = false; // 将loader的状态置为暂停
        }
    }
}
