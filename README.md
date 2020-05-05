
`           ******Ecommerce Web Application******

    This is an ecommerce web project based on blockchain platform.

  
  **PROTECTING SELLER'S INTEREST OR CASH ON DELIVERY BY USING SMART CONTRACT**

    
- We are implementing a solution for COD in e-commerce.
- We have planned a system based on a smart contract where the basic mechanism will go as below
- Customer order any product from an e-commerce site.
- If he/she choose cod then the purchase information will go to the respective seller and delivery agency.
- Then an agreement(smart contract) will establish between delivery agency and seller.
- This agreement(smart contract) will contain a virtual account which will store the product's price, seller's profit.
- After the product's delivery is confirmed by the customer both seller and delivery agency will get their shares.

  
_-_**It runs in a three tire architecture.**__
            
             1. Client Application
             2. SDK Application
             3. Network Application
            
             
- **Client Application : -**

``    Client applicaion is purely designed with php and all the user 
functionalities are maintained there. 


`    **- Different technologies are used in client side**`
            
            - HTML5
            - CSS3
            - Bootstarp4
            - JavaScript
            - Ajax
            - Php
            - Laravel 6
            
            
- **Network Application : -**

`    Here we are using hyper leger fabric network which is most 
popular project under blockchain. Here we create a private network 
which consist of two organizations and one orderer.

            - Ecom
            - Delivery
                
`    **- Different technologies are used in network side**`
         
            - Peer chain command
            - Docker components
            - Ubantu 16.04 LTS
     
    
   To perform ecom processes and maintain collaboration between two
organization we use a smart contract. Our smart contract acts as an endroser and developed
using different technology.

            - Go Lang
            - Fabric 1.4 support

- **SDK Application :-** 
    
    To communicate with network we use fabric sdk. Fabric sdk provides various functionalities
  to interact with the hyper ledger network. We created RESTFUL API using nodeJS for communication 
  between client application and network application. This API has various functionalities to inovke 
  and query the chaincode deployed on network
     
  
    **- Different technologies are used in REST API side**
        
          - NodeJs
          - MongoDb Atlas
          - Swagger API Docs
   
   
**_- SETUP DEVELOPMENT ENVIRONMENT :**_

`    _- API Docs: http:/localhost:8000/api-docs_
`   
   
    - **Requirements**: 
        - Make sure shopkart smart contract deployed on a hyper ledger fabric network and 
        running on your local machine.
        
        
1. Clone the repository to your local machine : 
    
        -` git clone https://github.com/udit6899/shopkart-api.git   `
         
2. Download dependencies to the project : 
    
        - npm install

3. Create a config folder under the project root directory : 
               
    `        - To setup configuration - create a process.env file 
    `          
         
        - e.g : /config/process.env
          
          - Process requirements : 
          
              # Admin Id for the application
              ADMIN = admin@shopkart.com
              
              # JWT secret key for use of jwt management
              JWT_SECRET_KEY = mysecret
              
              # Database url for the connection
              DB_URI = ************************
              
          - Sdk requirements : 
          
              # Chaincode name
              CONTRACT_ID = shopkart
              
              # Channel name
              NETWORK_NAME = ecomchannel
              
              # Crypto config file path
              CRYPTO_CONFIG_PEER_ORGANIZATIONS = /shopkart/network/client

4. Set up and start the network

5. Deploy your contract then install and instantiate chaincode

6. Change you port, If you want :
    
        - bin/www -> ~~8000~~ -> 9000

7. Launch the application : 
    
        - npm start

8. Test the API :
        
        - Go to : http://localhost:8000/api-docs        
        
    
   - **Further information contact: ecom-team**    
   
       Thank you !!!