using C1.DataCollection;

namespace SharedLibrary.Data
{
    public class CustomC1VirtualDataCollection<T> : C1VirtualDataCollection<T> where T : class
    {
        readonly C1DataCollection<T> data;

        public CustomC1VirtualDataCollection(ICollection<T> source)
        {
            this.data = new C1DataCollection<T>(source);
        }

        protected override async Task<Tuple<int, IReadOnlyList<T>>> GetPageAsync(
            int pageIndex,
            int startingIndex,
            int count,
            IReadOnlyList<SortDescription>? sortDescriptions = null,
            FilterExpression? filterExpression = null,
            CancellationToken cancellationToken = default)
        {
            if (sortDescriptions != null)
            {
                await data.SortAsync(sortDescriptions.ToArray());
            }

            if (filterExpression != null)
            {
                await data.FilterAsync(filterExpression);
            }

            var res = data.Skip(pageIndex * count).Take(count).Cast<T>().ToList();
            return new Tuple<int, IReadOnlyList<T>>(data.Count, res);
        }

        public override bool CanSort(params SortDescription[] sortDescriptions)
        {
            return data.CanSort(sortDescriptions);
        }

        public override bool CanFilter(FilterExpression filterExpression)
        {
            return data.CanFilter(filterExpression);
        }
    }

}