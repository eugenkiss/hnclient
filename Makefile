NPM_BIN=./node_modules/.bin

# Constants #
#############

port_dev=5001
port_ssr=5002

# Use dist instead of build prefix
# to remove the need for PHONY
out=dist
out_dll_dev=dist-dll-dev


# Installation #
################

# Smart install: Only executes if package.json's
# modification date is later than node_module's
install: node_modules

node_modules: package.json
	npm install
	@touch -m node_modules


# Dev Mode #
############

dev: node_modules build-dll-dev
	ENV=loc \
	PORT=$(or $(port),$(port_dev)) \
	$(NPM_BIN)/webpack-dev-server -d --progress --colors --open

$(out_dll_dev): node_modules webpack.dll.js webpack.config.js
	rm -rf ./$(out_dll_dev)
	OUTPUT_DLL=$(out_dll_dev) \
	$(NPM_BIN)/webpack --config webpack.dll.js --progress --profile

build-dll-dev: $(out_dll_dev)


# Building #
############

gen-shells: node_modules
	ENV=$(or $(env),loc) \
	PORT=$(or $(port),$(port_ssr)) \
	$(NPM_BIN)/ts-node -O '{"module":"commonjs","esModuleInterop":true}' src/ssr/gen-shells.tsx

build: node_modules src webpack.config.js
	rm -rf ./$(out)
	BUILD=true \
	OUTPUT=$(out) \
	$(NPM_BIN)/webpack --progress --profile
	$(MAKE) gen-shells env=prd
	$(NPM_BIN)/sw-precache --config=sw-precache-config.js


# Deployment #
##############

deploy: build
	firebase deploy
