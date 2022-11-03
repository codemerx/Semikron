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
                Page = (req.Skip / req.Take) + 1,
                Limit = (req.Take > 0) ? req.Take : 500,
            });

            return new DataResult()
            {
                Count = res.Total,
                Result = res.Data,
            };
        }

    }
}