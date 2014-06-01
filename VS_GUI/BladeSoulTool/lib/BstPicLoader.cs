using System.IO;
using System.Threading;
using System.Windows.Forms;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.lib
{
    class BstPicLoader
    {
        public static void LoadPic(string elementId, PictureBox picture, TextBox box)
        {
            
        }

        public static void LoadPic(JObject elementData, PictureBox picture, TextBox box = null)
        {

        }

        private static void runLoading(string url, string name, string path, PictureBox picture, TextBox box = null)
        {
            new Thread(() =>
            {
                // 更新图片成读取状态
                MethodInvoker loadingAction = () => picture.Image = BstManager.ConvertByteToImage(
                    BstManager.GetBytesFromFile(BstManager.PathRoot + BstManager.PathResources + "others/loading.gif")
                );
                picture.BeginInvoke(loadingAction);

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

                BstManager.ShowMsgInTextBox(box, "图片下载完成：" + url);

                // 转换成位图
                var bitmap = BstManager.ConvertByteToImage(blob);
                // 更新图片内容
                MethodInvoker updateAction = () => picture.Image = bitmap;
                picture.BeginInvoke(updateAction);
            }).Start();
        }
    }
}
