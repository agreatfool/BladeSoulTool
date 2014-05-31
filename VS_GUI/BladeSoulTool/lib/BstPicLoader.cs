using System.Windows.Forms;
using System.Threading;

namespace BladeSoulTool
{
    class BstPicLoader
    {
        public static void LoadPic(string url, string name, string path, PictureBox picture, TextBox box)
        {
            new Thread(() =>
            {
                // 更新图片成读取状态
                MethodInvoker loadingAction = () => picture.Image = BstManager.ConvertByteToImage(
                    BstManager.GetBytesFromFile(BstManager.PathRoot + BstManager.PathResources + "others/loading.gif")
                );
                picture.BeginInvoke(loadingAction);
                // 下载图片
                var blob = BstManager.DownloadImageFile(url, path);
                if (blob == null)
                {
                    MethodInvoker msgFailedAction = () => box.AppendText("图片下载失败：" + url + "\r\n");
                    box.BeginInvoke(msgFailedAction);
                    BstLogger.Instance.Log("[BstPicLoader] Pic download failed: " + url);
                    return; // 图片下载失败
                }
                MethodInvoker msgDownloadedAction = () => box.AppendText("图片下载完成：" + url + "\r\n");
                box.BeginInvoke(msgDownloadedAction);
                BstLogger.Instance.Log("[BstPicLoader] Pic downloaded: " + url);

                // 转换成位图
                var bitmap = BstManager.ConvertByteToImage(blob);
                // 更新图片内容
                MethodInvoker updateAction = () => picture.Image = bitmap;
                picture.BeginInvoke(updateAction);
            }).Start();
        }
    }
}
