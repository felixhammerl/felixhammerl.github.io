---
layout: post
title: Engineering Python in the CLI in 2021
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: A quick explainer on how effectively work with Python in the CLI.
---

For all the command line warriors out there, curating an effective setup for working with modern Python is often one of the more time-consuming tasks. Therefore, I decided to explain my setup. To work effectively in the CLI, you'll need, at a minimum, an IDE or at least a capable editor, and a debugger.

# Editor

Let's start with the editor. I'm a fan of vim, so I chose [neovim](https://neovim.io/) because of its modern architecture and its openness to extension. Neovim integrates with Python quite deeply through the `pynvim` package, but since any modern Python engineer will spend most of their time in venvs of their projects, it is reocmmended to *separate* the Python runtime that *neovim* uses from the runtime your *code* uses. Otherwise, you'd have to install `pynvim` in every single project's virtualenv, which is undesirable. Here's how you create a virtualenv with a runtime for neovim to play with: 

```
mkdir -p ~/.virtualenv
cd ~/.virtualenv
python3 -m venv ./neovim
source neovim/bin/activate
pip install --upgrade pynvim
```

Now that we have the venv set up, we need to point neovim to its Python runtime. You'll do this in your `~/.config/nvim/init.vim` with the following line: 

```
let g:python3_host_prog = '~/.virtualenv/neovim/bin/python'
```

So far, so good. Now, to work *effectively* on the code, I recommend `coc` ([see here](https://github.com/neoclide/coc.nvim)) with the following `coc` extensions:

- `coc-snippets`: This is a wrapper for UltiSnips, which is a very handy snippets helper
- `coc-pyright`: While Pylance is proprietary to VS Code, the Pyright project captures most of its goodness
- `coc-json`: JSON is ubiquitous no matter what language you're working in, so this comes in rather handy.
- For those working with web technologies, the extensions `coc-html`, `coc-css`, and `coc-tsserver` will come in handy as well. And there's a ton more.

I personally also use `vim-plug` to manage my other vim tools and integrations like `NERDTree`, `editorconfig`, `fzf`, `vim-surround`, `vim-commentary`, `vim-airline`, etc. But that's up to you. If you want to know more about my vim config, please have a look at my repo here: [https://github.com/felixhammerl/vim](https://github.com/felixhammerl/vim)

# Debugger

Not that we are able to author code, we'll have to take a look at debugging. Therefore, let me introduce you to `pudb` ([documentation](https://documen.tician.de/pudb/)). It's an ncurses-esque Python debugger that has all the amenities of a modern CLI. Since we're already writing the code in the terminal and executing the tests from there, why not also debug from here?

Setting a breakpoint in code in Python 3.7+ works by adding the line `breakpoint()`. `breakpoint` is syntactic sugar that translates to `import pdb; pdb.set_trace()`, which activates the Python debugger. The thing is, we don't want to open `pudb`, not`pdb`, which requires changing the implementation of `breakpoint()`. Luckily, we can easily tell Python what we want `breakpoint()` to actually mean with the environment variable `PYTHONBREAKPOINT`, like so:

```
PYTHONBREAKPOINT=pudb.set_trace python code.py
```

Even better than this, put `export PYTHONBREAKPOINT="pudb.set_trace"` into your shell config and forget about it!

Last, but not least, we'd like to integrate the whole thing with `pytest`, so we can debug our tests neatly, which for the most part means getting `pytest` to silence its CLI output and stay on the sidelines. `pudb` integrates into `pytest` with a little helper called `pytest-pudb`, which installs into your virtualenv, so when you run your tests, just add the flag `--pudb` and you're good to go. In the next example, I'll run a test marked as `only` in `pytest` and I want to open `pudb` when the execution hits `breakpoint()`:

```
PYTHONBREAKPOINT=pudb.set_trace STAGE=dev pytest test -m only -s --pudb
```

So, just install `pudb` and `pytest-pudb` into your project's virtualenv and have fun debugging!

