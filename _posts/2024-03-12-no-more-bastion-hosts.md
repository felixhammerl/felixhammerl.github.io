---
layout: post
title: Stop Using Bastion Hosts on AWS!
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: AWS finally delivered a way to connect to EC2 without exposing a public IPv4 address ...
---

There is now a means of connecting to EC2 instances in private subnets without requiring public IP addresses. As long as the machine can accept a TCP connection, you're golden. There is no additional cost attached outside of traffic.

What you're looking for is called EC2 Instance Connect Endpoint. Only ports `22` and `3389` are supported, but of course you can use additional ssh tunnels for port forwarding. You chuck one of these into your private subnet and tunnel through it.

Unfortunately, EC2 Instance Connect Endpoint doesn't support connections to an instance using IPv6 addresses, but that should not practically impact us too much.

```
ssh -i my-key-pair.pem ec2-user@i-0123456789example \
    -o ProxyCommand='aws ec2-instance-connect open-tunnel --instance-id i-0123456789example'
```

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

# Why is this relevant for security?

The first obvious benefit is that bastion hosts may be hardened, but they are still assets that need to be maintained and cost money. A bastion host needs to be isolated, but still have routes to all the important backend machines and databases that you would like to access. This is no trivial feat and a bastion host getting owned allows you to bypass most meaningful security checks, you can just walk into the database through the backdoor.

The second benefit is a bit less obvious: You can have a AWS VPC with a subnet that is completely cut off from the world through deny-all ACLs and you can still connect to EC2 machines through EC2 instance connect endpoints as long as the security groups allow for it!

That is an important distinction: A bastion host is a regular host that tunnel all traffic into a network, where it propagates through the regular routes. There is nothing special about a bastion host. If you put deny-all network ACLs in place, a bastion host is cut off, just like any other host. EC2 instance connect endpoints, however, do not route their traffic through the internet and the routing tables set in your VPC! Instead, they route their traffic through the AWS control plane and drop it straight into the ENI of the EC2 machine! 

This is amazing for forensic purposes if you believe that a network was compromised!

