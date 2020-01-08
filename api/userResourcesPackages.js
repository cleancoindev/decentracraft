// const Web3 = require('web3');
// const express = require('express');
// const https = require('https');
// const next = require('next')
// var bodyParser = require('body-parser');
// const cors = require('cors');
// const fs = require('fs');
const { waitForEvent } = require('../app/utils/utils');

const Contracts = require('../app/contracts.js');

// Get resources packages listed for wholesale
module.exports = async function (req, res) {
    
    await Contracts.loadContracts();

    console.log("Entering userResourcesPackages");
    console.log("req = " + req);
    console.log("req.method = " + req.method);
    var packagesjson = {
        packages: []
    };
    if (req.method === 'OPTIONS') {
        res.json(packagesjson.packages);
        return;
    }
    console.log("req.body = " + req.body);
    var bodyjson = JSON.parse(req.body);
    console.log("bodyjson = " + bodyjson);
    var player = bodyjson.player;
    console.log("player = " + player);
    // var accounts = await Contracts.web3.eth.getAccounts();
    var user1 = Contracts.ownerAccount;//accounts[0];
    //console.log("Account 0 = " + user1);

    var decentracraftWorld = await Contracts.DecentracraftWorld;
    var decentracraft = await Contracts.Decentracraft;//.deployed();
    var dciContract = await Contracts.DecentracraftItem;//.deployed();

    // var length = await mainContract.getItemIDsLength();
    
    var length = await decentracraftWorld.methods.getReservedPackagesIndex().call(); 

    console.log("items length = " + length);
    for(var i=0; i < length; i++){
        var package = await decentracraftWorld.methods.reservedPackages(i).call();
        var owner = await package.owner;
        if(owner.toLowerCase() != player.toLowerCase()){
            console.log("owner doesn't match : " + owner.toLowerCase());
            continue;
        }
        var price = await package.price;
        console.log("Package = " + package);
        console.log("Owner " + owner);
        console.log("price " + price);

        var resourcesCount = await decentracraftWorld.methods.getReservedResourcesPackagesResourcesCount(i).call();
        
        var resourcesjson = {
            resources: []
        };
        console.log("resourcesCount = " + resourcesCount);
        for(var r=0; r < resourcesCount; r++){
            var {_resourceID, _resourceSupply} = await decentracraftWorld.methods.getReservedResourcesPackagesResource(i, r).call();
            resourcesjson.resources.push({ 
                "id" : _resourceID,
                "name" : "resource " + _resourceID,
                "supply" : _resourceSupply,
            });
        }

        var nftsCount = await decentracraftWorld.methods.getReservedResourcesPackagesNFTsCount(i).call();
        var nftsjson = {
            nfts: []
        };
        console.log("nftsCount = " + nftsCount);
        for(var r=0; r < nftsCount; r++){
            var {_nftID, _nftProbability, _nftJSON, _nftURI} = 
                    await decentracraftWorld.methods.getReservedResourcesPackagesNFT(i, r).call();

            nftsjson.nfts.push({ 
                "id" : _nftID,
                "name" : "nft " + _nftID,
                "uri" : _nftURI,
                "json" : _nftJSON,
                "probability" : _nftProbability,
            });
        }
        
        
        packagesjson.packages.push({ 
            "packageID" : i,
            "name"  : "Package" + i,
            "price" : price,            
            "color": '#F6FEFC',
            "image": 'https://res.cloudinary.com/ddklsa6jc/image/upload/v1556888670/6_w93q19.png',
            "assetUrl": 'https://www.cryptokitties.co/',
            "currentOwner": owner,
            "description": '',
            "resources" : resourcesjson.resources,
            "nfts" : nftsjson.nfts,
        });

    }

    res.json(packagesjson.packages);
}
