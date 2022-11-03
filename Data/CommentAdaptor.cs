using Syncfusion.Blazor;
using Syncfusion.Blazor.Data;

namespace blazor_component_test.Data
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
            var res = await commentService.GetCommentsAsync(new()
            {
                Page = (req.Take > 0) ? (req.Skip / req.Take) + 1 : 0,
                Limit = (req.Take > 0) ? req.Take : 500,
            });

            return req.RequiresCounts ? new DataResult() { Result = res.Data, Count = res.Total } : (object)res.Data;
        }

    }
}