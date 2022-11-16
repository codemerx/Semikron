namespace SharedLibrary.Data
{
    public class ChartData : List<ChartItem>
    {
        public ChartData()
        {
            Init();
        }

        private void Init()
        {
            this.Add(new ChartItem()
            {
                Year = "2011",
                Downloads = 30,
                Streams = 5,
                Cpu = 2,
                Issues = 45,
                Comments = 15,
                Likes = 2,
            });
            this.Add(new ChartItem()
            {
                Year = "2012",
                Downloads = 35,
                Streams = 6,
                Cpu = 6,
                Issues = 40,
                Comments = 6,
                Likes = 6,
                Sells2 = 5,
                Profit = 5,
            });
            this.Add(new ChartItem()
            {
                Year = "2013",
                Downloads = 40,
                Streams = 8,
                Cpu = 8,
                Issues = 3,
                Comments = 32,
                Likes = 8,
            });
            this.Add(new ChartItem()
            {
                Year = "2014",
                Downloads = 45,
                Streams = 15,
                Cpu = 45,
                Issues = 2,
                Comments = 28,
                Likes = 45,
                Dislikes = 5,
                Sells1 = 5,
                Sells2 = 15,
                Profit = 15,
            });
            this.Add(new ChartItem()
            {
                Year = "2015",
                Downloads = 40,
                Streams = 23,
                Cpu = 40,
                Issues = 25,
                Comments = 38,
                Likes = 40,
                Dislikes = 55,
                Sells1 = 55,
                Sells2 = 30,
                Profit = 30,
            });
            this.Add(new ChartItem()
            {
                Year = "2016",
                Downloads = 35,
                Streams = 35,
                Cpu = 78,
                Comments = 35,
                Likes = 40,
            });
            this.Add(new ChartItem()
            {
                Year = "2017",
                Downloads = 30,
                Streams = 55,
                Cpu = 55,
                Comments = 2,
                Likes = 55,
            });
            this.Add(new ChartItem()
            {
                Year = "2018",
                Downloads = 10,
                Streams = 78,
                Cpu = 50,
                Comments = 6,
            });
        }

        public List<ChartItemNonNull> ToNonNull()
        {
            return this.Select(x => new ChartItemNonNull
            {
                Year = x.Year,
                Downloads = x.Downloads ?? 0,
                Streams = x.Streams ?? 0,
                Cpu = x.Cpu ?? 0,
                Issues = x.Issues ?? 0,
                Comments = x.Comments ?? 0,
                Likes = x.Likes ?? 0,
                Dislikes = x.Dislikes ?? 0,
                Sells1 = x.Sells1 ?? 0,
                Sells2 = x.Sells2 ?? 0,
                Profit = x.Profit ?? 0,
            }).ToList();
        }

        public IEnumerable<string> Years { get => this.Select(x => x.Year); }
        public IEnumerable<int?> Downloads { get => this.Select(x => x.Downloads); }
        public IEnumerable<int?> Streams { get => this.Select(x => x.Streams); }
        public IEnumerable<int?> Cpu { get => this.Select(x => x.Cpu); }
        public IEnumerable<int?> Issues { get => this.Select(x => x.Issues); }
        public IEnumerable<int?> Comments { get => this.Select(x => x.Comments); }
        public IEnumerable<int?> Likes { get => this.Select(x => x.Likes); }
        public IEnumerable<int?> Dislikes { get => this.Select(x => x.Dislikes); }
        public IEnumerable<int?> Sells1 { get => this.Select(x => x.Sells1); }
        public IEnumerable<int?> Sells2 { get => this.Select(x => x.Sells2); }
        public IEnumerable<int?> Profit { get => this.Select(x => x.Profit); }
    }

    public class ChartItem
    {
        public string Year { get; set; }
        public int? Downloads { get; set; }
        public int? Streams { get; set; }
        public int? Cpu { get; set; }
        public int? Issues { get; set; }
        public int? Comments { get; set; }
        public int? Likes { get; set; }
        public int? Dislikes { get; set; }
        public int? Sells1 { get; set; }
        public int? Sells2 { get; set; }
        public int? Profit { get; set; }
    }

    public class ChartItemNonNull
    {
        public string Year { get; set; }
        public int Downloads { get; set; }
        public int Streams { get; set; }
        public int Cpu { get; set; }
        public int Issues { get; set; }
        public int Comments { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public int Sells1 { get; set; }
        public int Sells2 { get; set; }
        public int Profit { get; set; }
    }
}