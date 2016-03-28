---
layout: post
title: Webapp Security 101
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: After reading this blog post, you should be familiar with a couple of simple mechanisms to provide a safer web experience for everyone
---

After reading this blog post, you should be familiar with a couple of simple mechanisms to provide a safer web experience for everyone.

## Don’t use protocol-relative URLs

This may seem counter-intuitive. Protocol-relative URLs always fall back to whatever protocol you’re using right now, i.e. if the current protocol is HTTPS, the browser will request assets via HTTPS, it the current protocol is HTTP, requests are done via HTTP. **BUT** it’s 2015 now, and things have gotten better. So please use HTTPS as the default protocol. Requesting via HTTPS is ok, even if your site does not have transport encryption, [but not vice-versa](http://www.netresec.com/?page=Blog&month=2015-03&post=China%27s-Man-on-the-Side-Attack-on-GitHub).

## Forwarding to HTTPS

Please note that this may only be a shim (please consider using HSTS preloading!), but it does have its merits. Still, an attacker could exploit the redirect to direct a user to a malicious site instead of the secure version of the original page. Drop this little snippet into your express server and it’ll forward all incoming traffic to HTTPS (the `X-Forwarded-Proto` part is assuming you’re use ELB before your EC2 instance).

    // redirect all http traffic to https
    app.use(function(req, res, next) {
        if ((!req.secure) && (req.get(‘X-Forwarded-Proto’) !== ‘https’)) {
            res.redirect(‘https://' + req.hostname + req.url);
        } else {
            next();
        }
    });

## HTTP Strict Transport Security (HSTS)

HSTS informs the browser that it should automatically upgrade all attempts to access the site using HTTP to HTTPS requests. In its original form, this still suffers from the Chicken-and-Egg problem: There is still a window where a user who has a fresh install is vulnerable. **But** all the major browsers (Chrome, Firefox, Safari, IE11, Edge) use [HSTS preloading](https://hstspreload.appspot.com/) by default now, i.e. a list of sites that are hardcoded into the browser as being HTTPS only.

Downside: On a non-preloaded site, site owners can use HSTS to track and identify users without using cookies.

## Cross Site Scripting (XSS) and Injection Attacks

You can get incredibly creative here, and mitigation of XSS is a tricky beast. Instead of wandering down into this rabbit hole, let’s just stick to the general good practices for now.

### Cross site scripting (XSS)

There’s two general types of XSS attacks: Stored (persistent) and reflected (non-persistent) XSS attacks.

In reflected XSS attacks, an attacker injects code within an HTTP response. The attack is not stored within the application itself, but the attacker can intrude into the security context. This is a one-off attack and can usually not be repeated or scaled indefinitely.

In stored XSS attacks, the malicious script is saved in the server and displayed permanently in the normal pages rendered to the visitors. Obviously, this is **really** bad, as it enables the attacker to intrude into the security context and hijack transactions **through** the legitimate server. This attack can potentially be repeated or scaled indefinitely as the legitimate origin is used to deploy the attack.

### Content-Security-Policy (CSP)

In the past, we’ve seen stuff like X-XSS-Protection, regex-based cleaning of user-submitted data, etc. and despite having good intentions, **this isn’t anywhere near as thorough as CSP**.

The browser trusts the content it receives from the server, which opens an attack window where malicious scripts are executed by the victim’s browser, even when it’s not coming from where it seems to be coming from. Hence, CSP helps to detect and mitigate certain types of attacks, e.g. XSS and some other injection attacks. A good measure is to be as restrictive as possible, and as permissive as necessary, depending on what your website requirements for scripts/images/embeds/styles/… are.

Please check out [MDN](https://developer.mozilla.org/en-US/docs/Web/Security/CSP) for further information on how to deploy CSP.

### Sandboxing

It is 2015, but the web still has no concept of views. There’s nothing that allows you to encapsulate and style child content (e.g. Web Components), but still have security properties of a sandbox. So if you want display user-generated content an isolated sandbox with its own origin, while keeping your security context untouched, you’ll have to bite the bullet: iframe is still the way to go.

    <iframe src=“…” sandbox=“…”></iframe>

[Please check MDN for further information on how to use iframe sandboxing](https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe).

### Sanitize user input

[Cure53](https://cure53.de/), a Berlin-based team of experienced security experts and penetration testers, has created a XSS sanitizer for HTML, MathML, and SVG, named [DOMPurify](https://github.com/cure53/DOMPurify). If you have anything that displays user input, I’d suggest you have a look at DOMPurify.

If you use DOMPurify and iframe sandboxing, it’s a good idea to strip the text you want to display in the security context where you actually display it. The idea is that if there’s a bug or something bypasses DOMPurify, it will still be caught in the sandbox.

## HTTP Public Key Pinning (HPKP)

For this one, you need to have some idea about how the CA system works. In TLS sessions, trust is based on your server’s public key, which is usually signed by a certificate authority (CA), hence the CA is the trust anchor. The browser vendors each maintain a list of trusted CAs. Paradoxically, those CAs can create certificates for *arbitrary* domain names, and every now and then, they tend to get compromised. If an attacker is able to compromise a single CA, he can perform MITM attacks on various TLS connections. 

HPKP tells the client which public key belongs to a certain web server, i.e. it tries to mitigate that by shifting the trust anchor to the server’s public key itself, using Trust on First Use (TOFU). By associating a specific public key with a certain web server, HPKP prevents MITM attacks with forged certificates. 

HPKP is enabled by returning the `Public-Key-Pins` HTTP header when your site is accessed over HTTPS.

For more on how to use HPKP, please check out [this tutorial](https://timtaubert.de/blog/2014/10/http-public-key-pinning-explained/), [MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning), and [RFC 7469](https://tools.ietf.org/html/rfc7469)


## Clickjacking via X-Frame-Options

Clickjacking tricks users into clicking on something different from what they expect to be clicking on, triggering possibly unexpected actions. A famous application of this attack is [likejacking](https://www.sophos.com/en-us/security-news-trends/security-trends/what-is-likejacking.aspx). UI redressing can be mitigated by CSP and the X-Frame-Options header.

    Content-Security-Policy: frame-ancestors ‘none’, ’self’, or allowed origins

    X-Frame-Options: DENY, SAMEORIGIN, or ALLOW-FROM origin

For further information, check out [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) and [RFC 7034](https://tools.ietf.org/html/rfc7034)


## MIME-Sniffing attacks

**Blast from the past!** This is a security feature that helps prevent attacks based on MIME-type confusion. To mount a content-sniffing XSS attack, the attacker uploads a GIF/HTML chameleon, which the browser treats as HTML and runs the attacker’s JavaScript. MS has created an HTTP header, which alters IE’s behavior when parsing unknown or ambiguous MIME types. `X-Content-Type-Options` reduces exposure to drive-by download attacks and sites serving user uploaded content that, could be treated as code (executable or HTML).

    X-Content-Type-Options: nosniff

Downside: It works in IE, and only in some specific cases.

Better than relying on this header is asking the following questions: 

* Is it safe to serve user-provided files?
* Can I restrict the content type of files uploaded to my site?
* Is it safe replay user-provided mime types?

The answer to all of the above is: No, you should never ever ever replay user-supplied files with user-supplied MIME types. **But** if necessary, you can serve user-supplied files under a different origin, e.g. a sandboxed iframe, so that it can’t violate your current security context (see above).

## Session Management

A modern web application is dynamic and stateful, whereas HTTP is a stateless protocol. Cookies are small chunks of information that websites can store on computers from where it was accessed. to identify you when you go back to the website that stored the token in the first place. Cookies written by website A cannot be accessed by another website B, instead they are only sent to the issuer as part of the HTTP request.

Cookies contain sensitive information, so please make sure they are encoded or encrypted to protect the information they contain. Here’s a couple of cookie attributes and properties you should pay attention to:

* `secure`: Disallow sending the cookie in the clear .
* `HttpOnly`: Disallow extracting the cookie via JS in XSS attacks.
* `domain`: Duh.
* `expires` and `max-age`: Don’t keep your seesions open indefinitely
* Randomness: To avoid sessions hijacking, make the session IDs hard to guess. An entertaining example of session hijacking can be found [here](https://www.youtube.com/watch?v=O5xRRF5GfQs).

For further information, check out [Wikipedia](https://en.wikipedia.org/wiki/HTTP_cookie) and [RFC 2965](http://tools.ietf.org/html/rfc2965).

## Cross-Site Request Forgery (CSRF)

CSRF is an attack that forces a user to execute unwanted actions on a web application in which they are currently authenticated. CSRF attacks are used by an attacker to make a target system perform a function via the target’s browser. Impacts of successful CSRF exploits vary greatly based on the role of the victim. Attack a user, maybe make some transactions, wire some fundsm etc.. Attack an admin, possibly get access to the whole system. Whoa.

Luckily, there’s things like the [express middleware for CSRF protection](https://www.npmjs.com/package/csurf) to help you mitigate that. Phew.

## Prevent password cracking

So you’re creating a service that requires a login. What you should keep in mind is what happens when someone can access your user database: You don’t wanna get caught storing plaintext passwords. Per standard practice, the user’s password itself is not stored, but instead you use a key derivation function function to obfuscate the password. Please remember to incorporate a salt to protect against rainbow table attacks. Typical examples are PBKDF2, Bcrypt or Scrypt. Yes, those functions are computationally expensive, so I may be going out on a limb here, but making the user wait a couple of milliseconds before being able to log in is definitely better than having your user database stolen.

## Proof-of-work

Proof-of-work systems use the same mechanism you use to secure your password and apply it ex-ante, before a certain resource can be requested. [Wikipedia](https://en.wikipedia.org/wiki/Proof-of-work_system):

> A proof-of-work system is an economic measure to deter denial of service attacks and other service abuses such as spam on a network by requiring some work from the service requester, usually meaning processing time by a computer. 

A typical example is a challenge-response protocol, where something as simple as computing a hash shifts the computational burden to the attacker and make attacks economically uninteresting.

## Further reading

For further information, please consult the [OWASP Web Application Security Testing Cheat Sheet](https://www.owasp.org/index.php/Web_Application_Security_Testing_Cheat_Sheet).
