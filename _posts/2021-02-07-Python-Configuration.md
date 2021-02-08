---
layout: post
title: Lightweight Python Environment Configuration
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: Using Python Data Classes for stupidly simple configuration parsing
---

tl;dr: Use one environment variable and Data Classes for stupidly simple configuration parsing.

# Y tho?

A great many things have been built to simplify handling of configuration files in an ecosystem as mature as Python. So it was even more a surprise to me that I didn’t find a proper lightweight way to achieve these things:

* Preferably JSON config files on disk. I don’t mind YAML, but I dislike INI.
* In code, I want classes and properties with actual types (at least for primitive values) and dot-syntax, not `{“dictionaries”}` and `.get()`.
* No more than 2 minutes spent reading documentation. Y’all can get off my lawn with overengineered libraries for something so simple.
* Support for multiple environments.
* As much builtins as possible, no library just for my runtime config.

On my way through the Python ecosystem, my first stop was [`configparser`](https://docs.python.org/3/library/configparser.html). While initially looking great, there was this little caveat:

> Config parsers do not guess datatypes of values in configuration files, always storing them internally as strings. This means that if you need other datatypes, you should convert on your own.

So without further help by other libraries, `configparser` was out.

The next quick stop was at [`attrs`](https://www.attrs.org/en/stable/). It would give me actual classes with actual properties, as opposed to typing-mess of Dictionaries.

But, not all was golden. The more I worked with it, the more I realized that it was massively overengineered, complex, and that I probably would not need `attrs` at all. The reason is that `attrs` for the most part is a workaround for a simple feature that was delivered in Python 3.7: [Data Classes](https://docs.python.org/3/library/dataclasses.html).

> With data classes, you do not have to write boilerplate code to get proper initialization, representation, and comparisons for your objects. 

See: [https://realpython.com/python-data-classes/](https://realpython.com/python-data-classes/)

Data Classes are a major push forward for Python to leave its object oriented past behind and move to greener, more functional pastures. Data Classes are structs on steroids, doing what classes were meant to do: Encapsulate state. Mixing logic and state is a bad idea, but since functions are a first class citizen in Python already, Data Classes fit in perfectly!

Data Classes bring (amongst other things) three great features for my use case:

* Proper typing support, they are actual classes after all.
* Reduction of boilerplate, as the relevant `__dunder__` methods are implicit (but can be overridden where needed).
* A lot of flexibility due to a toll-ree bridge between [Data Classes and Dictionaries](https://docs.python.org/3/library/dataclasses.html#dataclasses.asdict).

If we extend the toll-free bridge between Data Classes and Dictionaries by the bridge between Dictionaries and JSON, we have everything we need.

# But ...

While Data Classes can be easily converted into Dictionaries through the builtin [`asdict`](https://docs.python.org/3/library/dataclasses.html#dataclasses.asdict), the reverse is not possible through the standard library.

However, there is one tiny, but immensely helpful library called `dacite`, which fills this gap with its function [`from_dict`](https://github.com/konradhalas/dacite).

# Success!

With just 7 lines of code, we can satisfy all of the requirements above:

```
def load():
    base_path = os.path.abspath(os.path.dirname(__file__))
    env = os.environ.get('STAGE', 'local')
    config_path = os.path.join(base_path, f"{env}.json")
    with open(config_path, 'r') as f:
        data = json.loads(f.read())
    return from_dict(data_class=Config, data=data)
```

Working in a serverless multi-stage deployment, I load the current stage from the `STAGE` environment variable. The content of the environment variable determines, which config will be loaded.

In my case, alongside this code are three JSON files: 

* `local.json` includes the configuration for my unit and integration tests, as well as local debugging.
* `dev.json` includes the configuration for my development environment and functional tests.
* `prod.json` includes the configuration for my production environment.

All three configuration files are similarly structured.

Here is what my solution is not:

* Foolproof: If an environment is improperly configured, I want my configuration handler to load eagerly on startup and be the first thing to blow up, telling me where I messed up. As this code is parsed and loaded while the imports are being resolved, this is achieved.
* Free of redundancy: Yes, there is redundancy among the three different configuration files. I value having everything at a glance in a file over saving three lines of seldom-touched code.
* Smart: Having had the displeasure of config parsers with complex substitutions of default configurations being loaded and overridden in a certain order, simplicity is truly a blessing. The cognitive overhead and bugs are never worth it.

# Where da code at?

You can find the sample code in [this Github repo](https://github.com/felixhammerl/python-config).

