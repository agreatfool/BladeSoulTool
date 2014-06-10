using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Newtonsoft.Json.Linq;
using Timer = System.Timers.Timer;

namespace BladeSoulTool.lib
{
    class BstPicLoader
    {
        private static readonly Dictionary<PictureBox, Timer> LoadingTimers = new Dictionary<PictureBox, Timer>();

        public static void LoadPic(int type, string elementId, PictureBox picture, TextBox box = null)
        {
            var data = BstManager.Instance.GetAllDataByType(type);
            var elementData = (JObject) data[elementId];

            BstPicLoader.LoadPic(type, elementData, picture, box);
        }

        public static void LoadPic(int type, JObject elementData, PictureBox picture, TextBox box = null)
        {
            var url = BstManager.GetItemPicUrl(type, elementData);
            var path = BstManager.GetItemPicTmpPath(type, elementData);

            BstPicLoader.RunLoading(url, path, picture, box);
        }

        private static void RunLoading(string url, string path, PictureBox picture, TextBox box = null)
        {
            new Thread(() =>
            {
                Timer loadingTimer = null;
                if (!BstPicLoader.LoadingTimers.ContainsKey(picture))
                {
                    // 更新图片成读取状态，如果Dictionary里已经有这个PictureBox的Timer了，说明loading图已经加载了
                    var loadingGif = new BstGifImage(BstManager.PathLoadingGif) { ReverseAtEnd = false };
                    loadingTimer = new Timer(50);
                    loadingTimer.Elapsed += (s, e) =>
                    {
                        MethodInvoker loadingAction = () =>
                        {
                            picture.Image = loadingGif.GetNextFrame();
                        };
                        try
                        {
                            picture.BeginInvoke(loadingAction);
                        }
                        catch (InvalidOperationException ex)
                        {
                            BstLogger.Instance.Log(ex.ToString());
                            // 因为我们可能会在GUI_Picture的UI中的PictureBox里显示loading动态图
                            // 而上述的窗口可能在关闭后被销毁，这里我们需要处理窗口被销毁后的错误
                            // 这时候Timer应该在Dictionary里注册过了
                            if (BstPicLoader.LoadingTimers.ContainsKey(picture))
                            {
                                var timer = BstPicLoader.LoadingTimers[picture];
                                timer.Enabled = false;
                                BstPicLoader.LoadingTimers.Remove(picture);
                                timer.Dispose();
                            }
                        }
                    };
                    BstPicLoader.LoadingTimers.Add(picture, loadingTimer);
                    loadingTimer.Enabled = true;
                }
                else
                {
                    loadingTimer = BstPicLoader.LoadingTimers[picture];
                }

                // 检查是否有本地缓存
                byte[] blob = null;
                if (File.Exists(path))
                {
                    // 本地缓存存在，直接读取
                    blob = BstManager.GetBytesFromFile(path);
                }
                else
                {
                    // 下载图片
                    blob = BstManager.DownloadImageFile(url, path);
                    if (blob == null)
                    {
                        BstManager.ShowMsgInTextBox(box, "图片下载失败：" + url);
                        return; // 图片下载失败
                    }
                }

                loadingTimer.Enabled = false; // 加载完成，停止动态loading图的更新
                BstPicLoader.LoadingTimers.Remove(picture); // 加载完成，删除Dictionary里注册的Timer
                loadingTimer.Dispose();

                BstManager.ShowMsgInTextBox(box, "图片下载完成：" + url);

                // 转换成位图
                var bitmap = BstManager.ConvertByteToImage(blob);
                // 更新图片内容
                MethodInvoker updateAction = () => picture.Image = bitmap;
                try
                {
                    picture.BeginInvoke(updateAction);
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
            }).Start();
        }
    }
}
