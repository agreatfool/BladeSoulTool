using System;
using System.IO;
using System.Text;
using System.Timers;

namespace BladeSoulTool
{
    class BstLogger
    {
        private static BstLogger _instance;

        public static BstLogger Instance 
        {
            get 
            {
                if (_instance == null)
                {
                    _instance = new BstLogger();
                }
                return _instance;
            }
        }

        private readonly StringBuilder _buff;

        private BstLogger()
        {
            var logPath = BstManager.PathVsRoot + BstManager.PathVsLog + DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss-ffff") + ".log";
            BstManager.CreateFile(logPath);
            var timer = new Timer(5000);
            this._buff = new StringBuilder();
            timer.Elapsed += (sender, args) => File.AppendAllText(logPath, _buff.ToString());
            timer.AutoReset = true;
            timer.Enabled = true;
        }

        public void Log(string msg)
        {
            Console.WriteLine(msg);
            this._buff.AppendLine(DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss-ffff") + " " + msg);
        }
    }
}
