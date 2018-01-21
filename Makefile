# Constants #
#############

port_dev=5001
port_ssr=5002

# Use dist instead of build prefix
# to remove the need for PHONY
out=dist
out_dll_dev=dist-dll-dev

webpack=./node_modules/webpack/bin/webpack.js
webpack-dev-server=./node_modules/webpack-dev-server/bin/webpack-dev-server.js
sw-precache=./node_modules/sw-precache/cli.js
ts-node=./node_modules/ts-node/dist/bin.js
#typescript=./node_modules/typescript/bin/tsc # TODO


# Installation #
################

# Smart install: Only executes if package.json's
# modification date is later than node_module's
install: node_modules

node_modules: package.json
	npm install
	@rm -f node_modules/.modified
	@touch -m node_modules/.modified


# Dev Mode #
############

dev: node_modules build-dll-dev
	ENV=loc \
	PORT=$(or $(port),$(port_dev)) \
	$(webpack-dev-server) -d --progress --colors --open

$(out_dll_dev): node_modules webpack.dll.js
	rm -rf ./$(out_dll_dev)
	OUTPUT_DLL=$(out_dll_dev) \
	$(webpack) --config webpack.dll.js --progress --profile

build-dll-dev: $(out_dll_dev)

gen-shells-dev: node_modules
	ENV=loc \
	PORT=$(or $(port),$(port_ssr)) \
	$(ts-node) -O '{"module":"commonjs"}' src/ssr/gen-shells.tsx


# Building #
############

build: node_modules src
	rm -rf ./$(out)
	BUILD=true \
	OUTPUT=$(out) \
	$(webpack) --progress --profile
	$(sw-precache) --config=sw-precache-config.js


# Deployment #
##############

deploy: build
	firebase deploy
