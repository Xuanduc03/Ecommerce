using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Reflection;

public static class ServiceCollectionAutoRegisterExtensions
{
    public static IServiceCollection AddRepositoriesAndServicesByConvention(this IServiceCollection services, Assembly assembly)
    {
        // Đăng ký Repository
        var repoTypes = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Repository"))
            .ToList();

        foreach (var type in repoTypes)
        {
            var iface = type.GetInterface("I" + type.Name); // VD: IShippingAddressRepository
            if (iface != null)
            {
                services.AddScoped(iface, type);
            }
        }

        // Đăng ký Service
        var serviceTypes = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Service"))
            .ToList();

        foreach (var type in serviceTypes)
        {
            var iface = type.GetInterface("I" + type.Name); // VD: IShippingAddressService
            if (iface != null)
            {
                services.AddScoped(iface, type);
            }
        }

        return services;
    }
}