# python setup.py develop
from setuptools import setup, find_packages

setup(name='mooglePy',
      version='0.0.2',
      description='Mooogle server communication library',
      url='http://github.com/elec_otago/moogle',
      author='Tim Molteno, Mark Butler',
      install_requires=['requests'],
      license='Copyright',
      packages=['mooglePy'])
