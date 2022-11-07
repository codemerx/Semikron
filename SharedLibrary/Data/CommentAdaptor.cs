using Syncfusion.Blazor.Data;
using Syncfusion.Blazor;

namespace SharedLibrary.Data
{
    public class CommentAdaptor : DataAdaptor
    {
        private readonly CommentService commentService;

        public CommentAdaptor(CommentService commentService)
        {
            this.commentService = commentService;
        }

        public override async Task<object> ReadAsync(DataManagerRequest req, string key = null)
        {
            var page = (req.Take > 0) ? (req.Skip / req.Take) + 1 : 1;
            var limit = (req.Take > 0) ? req.Take : 500;

            Console.WriteLine($"Page: {page} Limit: {limit}");

            var res = await commentService.GetCommentsAsync(new()
            {
                Page = page,
                Limit = limit,
            });

            return req.RequiresCounts ? new DataResult() { Result = res.Data, Count = res.Total } : (object)res.Data;
        }

    }
}
