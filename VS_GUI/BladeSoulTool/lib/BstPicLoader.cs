using System.IO;
using System.Threading;
using System.Windows.Forms;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.lib
{
    class BstPicLoader
    {
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
                // 更新图片成读取状态
                MethodInvoker loadingAction = () => picture.Image = BstManager.Instance.LoadingGifBitmap;
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
