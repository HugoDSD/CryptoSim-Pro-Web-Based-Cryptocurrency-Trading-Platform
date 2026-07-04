namespace BackEnd_CryptoSim.COMMON;

public class ServiceException : Exception
{
    public ErrorCode Code { get; }

    public ServiceException(ErrorCode code, string message) : base(message)
    {
        Code = code;
    }
}