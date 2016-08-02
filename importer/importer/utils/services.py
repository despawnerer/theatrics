import socket
from time import time, sleep


__all__ = ['wait_for_all_services', 'wait_for_service']


def wait_for_all_services(endpoint_list, timeout):
    for endpoint in endpoint_list:
        wait_for_service(endpoint, timeout)


def wait_for_service(endpoint, timeout):
    host, port = endpoint.split(':')
    wait_until = time() + timeout

    while True:
        try:
            connection = socket.create_connection((host, port))
        except:
            if time() < wait_until:
                sleep(1)
            else:
                raise
        else:
            connection.close()
            return
