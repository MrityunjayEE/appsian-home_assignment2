namespace ProjectManager.DTOs;

public class ErrorResponse
{
    public List<ErrorDetail> Errors { get; set; } = new();
}

public class ErrorDetail
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
