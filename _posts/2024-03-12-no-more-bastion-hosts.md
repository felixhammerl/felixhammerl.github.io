---
layout: post
title: Stop using bastion hosts on AWS!
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: AWS finally delivered a way to connect to EC2 without exposing a public IPv4 address ...
---

There is now a means of connecting to EC2 instances in private subnets without requiring public IP addresses. As long as the machine can accept a TCP connection, you're golden. There is no additional cost attached outside of traffic.

What you're looking for is called EC2 Instance Connect Endpoint. Only ports `22` and `3389` are supported, but of course you can use additional ssh tunnels for port forwarding. You chuck one of these into your private subnet and tunnel through it.

Unfortunately, EC2 Instance Connect Endpoint doesn't support connections to an instance using IPv6 addresses, but given the upside of not having to mess with a bastion host, this should be fine.

[Connect using EC2 Instance Connect Endpoint to a Linux instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-using-eice.html)

That's it. You don't even have to remember that, you can just chuck it all into your ssh config.

```
Host myhost
    HostName i-0123456789example
    User ec2-user
    Port 22
    IdentityFile ~/.ssh/my-key-pair.pem
    ProxyCommand aws ec2-instance-connect open-tunnel --instance-id i-0123456789example
```

For windows, you just forward the RDP port and then connect to `localhost:<local port>`

```
aws ec2-instance-connect open-tunnel \
    --instance-id i-0123456789example \
    --remote-port 3389 \
    --local-port <local port>
```

[Connect using EC2 Instance Connect Endpoint to a Windows instance](https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/connect-using-eice.html#eic-connect-using-rdp)

If you plan on maintaining a fleet of EC2 machines, and keeping them patched, you should probably look at AWS SSM Fleet Manager, though. 