using System;
using System.IO;
using System.Text;
using System.Timers;

namespace BladeSoulTool
{
    class BstLogger
    {
        private static BstLogger instance;

        public static BstLogger Instance 
        {
            get 
            {
                if (instance == null) 
                {
                    instance = new BstLogger();
                }
                return instance;
            }
        }

        private readonly string logPath;
        private Timer timer;
        private readonly StringBuilder buff;

        private BstLogger()
        {
            this.logPath = BstManager.PathVsRoot + BstManager.PathVsLog + DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss-ffff") + ".log";
            BstManager.CreateFile(this.logPath);
            this.timer = new Timer(5000);
            this.buff = new StringBuilder();
            this.timer.Elapsed += (sender, args) => //File.AppendAllText(this.logPath, buff.ToString());
            this.timer.AutoReset = true;
            this.timer.Enabled = true;
        }

        public void Log(string msg)
        {
            Console.WriteLine(msg);
            buff.AppendLine(DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss-ffff") + " " + msg);
        }
    }
}
