namespace blazor_component_test.Data
{
    public class ServiceResponse<T>
    {
        public int Total { get; set; }
        public T[] Data { get; set; }
    }
}
