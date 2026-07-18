---
title: ZedGraph在Web中的使用
date: 2009-06-06
categories: [技术]
tags: [AspNet, ZedGraph, 报表统计]
---

上一篇[SQL实现分组统计查询（按月、小时分组）](http://blog.fwhyy.com/2009/06/sql-implementation-group-statistical-query/) 中介绍了按月和小时为单位怎样实现分组查询，在本文中会实现将上文查询的结果以图表的形式显示在页面上。在页面上显示图标有很多种解决方案，office的owc组建、自己写代码、或者是第三方的控件。本文中将使用ZedGraph控件来实现。选择ZedGraph有两个原因：

1. 该控件是开源的，在必要的时候可以根据自己的需要来修改；
2. 该控件所显示的图片是绘出来的，而不是生成的图片。

下载地址：[http://sourceforge.net/project/showfiles.php?group_id=114675](http://sourceforge.net/project/showfiles.php?group_id=114675)

1 将控件引用到项目中，本示例使用的是5.1.5版。

在工具栏下方的空白处点击右键—>添加选项卡,命名为ZedGraph

![2010-12-30_101747](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290709681.gif)
![2010-12-30_101836](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290709929.gif)

在ZedGraph选项卡点右键—>选择项…,在弹出窗口中选择下载下来的ZedGraph.Web.dll文件。

![14712687428710.jpg](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290709682.jpg)

2 在项目中新建一aspx页面，命名为Year.aspx,将刚添加的ZedGraph控件拖到页面中，并在页面中添加一个文本框和一个按钮，文本框用来选择年份。

![2010-12-30_102641](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710090.gif)

3 切换到代码视图，添加如下代码：

```
namespace ZedGraphDemo
{
    public partial class Year : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            this.ZgwYear.RenderGraph +=
                new ZedGraphWebControlEventHandler(ZgwYear_RenderGraph);
        }

        void ZgwYear_RenderGraph(ZedGraphWeb webObject,
            System.Drawing.Graphics g, MasterPane pane)
        {
            GraphPane myPane = pane[0];

            // 标题
            myPane.Title.Text = "每年分析（月为单位）";
            myPane.XAxis.Title.Text = "时间";
            myPane.YAxis.Title.Text = "访问量";

            // 坐标对集
            PointPairList list = new PointPairList();
            //PointPairList list1 = new PointPairList();
            //PointPairList list2 = new PointPairList();

            //从数据库中获取数据集
            DataTable dtYear = GetData();
            if (dtYear == null)
                return;
            for (int i = 0; i < dtYear.Rows.Count; i++)
            {
                list.Add(Convert.ToDouble(i), Convert.ToDouble(dtYear.Rows[i]["Count"]));
                //如果有多种类型，可以添加多个
                //list1.Add(Convert.ToDouble(i), Convert.ToDouble(dtYear.Rows[i]["Count1"]));
                //list2.Add(Convert.ToDouble(i), Convert.ToDouble(dtYear.Rows[i]["Count2"]));
            }

            BarItem myBar = myPane.AddBar("页面访问", list, Color.Blue);
            //BarItem myBar1 = myPane.AddBar("", list1, Color.Red);
            //BarItem myBar2 = myPane.AddBar("", list2, Color.Yellow);

            myBar.Bar.Fill = new Fill(Color.Blue, Color.White, Color.Blue);
            //myBar1.Bar.Fill = new Fill(Color.Red, Color.White, Color.Red);
            //myBar2.Bar.Fill = new Fill(Color.Yellow, Color.White, Color.Yellow);

            myPane.XAxis.MajorTic.IsBetweenLabels = true;
            // X轴Label
            string[] labels = new string[] { "1月", "2月", "3月", "4月", "5月", "6月",
                                             "7月", "8月", "9月", "10月", "11月", "12月" };

            //设置x轴刻度
            myPane.XAxis.Scale.TextLabels = labels;
            myPane.XAxis.Type = AxisType.Text;

            // 颜色填充
            myPane.Fill = new Fill(Color.White, Color.FromArgb(200, 200, 255), 45.0f);
            myPane.Chart.Fill = new Fill(Color.White, Color.LightGoldenrodYellow, 45.0f);

            pane.AxisChange(g);

            myPane.YAxis.Scale.Max += myPane.YAxis.Scale.MajorStep;
            BarItem.CreateBarLabels(myPane, false, "f0"); //在柱状图上方显示统计数
        }

        protected void btnQuerys_Click(object sender, EventArgs e)
        {
            GetData();
        }

        private DataTable GetData()
        {
            SqlHelper.ConnectionString =
                ConfigurationManager.AppSettings["ConnectionString"].ToString();
            SqlParameter[] parameters = new SqlParameter[1];

            parameters[0] = new SqlParameter("@Year", SqlDbType.Int, 4);
            parameters[0].Value = this.txtYear.Value.Trim().Length == 0 ? DateTime.Now.Year :
                                                  Convert.ToInt32(txtYear.Value.Trim());
            DataSet ds = SqlHelper.ExecuteDataset("Counter_CounterYear", parameters);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                return ds.Tables[0];
            }
            else
            {
                return null;
            }
        }
    }
}
```

4 在项目的根目录下创建一个名为ZedGraphImages的文件夹，只是作为ZedGraph绘图时的一个临时目录，并不会在该文件夹中生成图片，如果没有该文件夹会报异常。

[代码下载](http://files.cnblogs.com/oec2003/ZedGraphDemo.rar)

