using System.Data;
using System.Windows.Forms;

namespace BladeSoulTool.lib
{
    class BstIconLoadTask
    {
        public string Url { get; set; } // url to load the pic
        public string Name { get; set; } // image file name
        public DataGridView Grid; // DataGridView contains the DataTable
        public DataTable Table; // DataTable contains the pic
        public int RowId { get; set; } // DataTable line to be updated
        public TextBox Box { get; set; } // TextBox to write message
        public int ColId { get; set; } // DataTable column to be updated

        public BstIconLoadTask(string url, string name, DataGridView grid, DataTable table, int rowId = 0, TextBox box = null, int colId = 0)
        {
            this.Url = url;
            this.Name = name;
            this.Grid = grid;
            this.Table = table;
            this.RowId = rowId;
            this.Box = box;
            this.ColId = colId;
        }
    }
}
