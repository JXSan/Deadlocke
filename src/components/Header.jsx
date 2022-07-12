import React,{Fragment, useState } from "react";
import logo from "../assets/logo.png";
import deadlockeLogo from "../assets/deadlocke-logo.png";
import { useMoralis, useChain, useNativeBalance } from "react-moralis";
import { PolygonLogo, BSCLogo, ETHLogo } from "./Chains/Logos";
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { getEllipsisTxt } from "../helpers/formatters";


const style = {
  wrapper: `p-4 w-screen items-center flex justify-between font-mono text-lg`,
  headerLogo: `h-32`,
  headerOptions: `left-0 pl-20 flex items-center justify-between space-x-2`,
  headerAccountWrapper: `right-0 flex items-center space-x-3 text-lg pl-4 rounded-md text-black bg-orange-300`,
  accountAddressButtonConnected: `p-6 text-black text-lg font-normal bg-orange-300 rounded-md`,
  accountAddressButton: `p-6 text-black text-lg font-normal bg-orange-300 rounded-md`,
  headerAccountConnected: `flex items-center justify-center space-x-2`,
  networkButton: `text-lg`,
  logout: `p-6 bg-orange-400 hover:bg-orange-300 rounded-md`,
}

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
  },
  button: {
    border: "2px solid rgb(231, 234, 243)",
    borderRadius: "12px",
  },
};

const menuItems = [
  {
    key: "0x1",
    value: "Ethereum",
    icon: <ETHLogo />,
  },
  {
    key: "0x89",
    value: "Polygon",
    icon: <PolygonLogo />,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function NetworkDropDown(){
  const { chainId, switchNetwork } = useChain();
  const {isAuthenticated} = useMoralis();
  const network = chainId != null ? menuItems.find((item) => item.key === chainId).value : "...";
  const handleMenuClick = (e) => {switchNetwork(e.target.value);};

  if(isAuthenticated && chainId != null){
    return (
      <>
      <Menu as="div" className="relative inline-block text-left">
        <div className="flex items-center">
          <Menu.Button className="inline-flex justify-center w-full rounded-md shadow-sm px-4 p-6 bg-orange-400 hover:bg-orange-300">            {network}
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>
  
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-orange-200">
            <div className="py-1">
              {
                menuItems.map((data, key) => {
                  return(
                  <Menu.Item>
                  {({ active }) => (
                    <button
                    value={menuItems[key].key}
                      onClick={(e) => handleMenuClick(e)}
                      type="button"
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-lg'
                      )}
                    >
                      {menuItems[key].value}
                    </button>
                  )}
                </Menu.Item>
                )
                })
              }
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      </>
    )
  } else return null;
}

function Account() {
  const { authenticate, isAuthenticated, account, chainId, logout } = useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const { data: balance } = useNativeBalance(account);

  if(!isAuthenticated || !account){
    return (
      <>
      <button className={style.accountAddressButton} type="button" onClick={authenticate}>Connect Wallet</button>
      </>
    )
  }

  return (
    <>
      <div className={style.headerAccountWrapper}>
        <div className={style.headerAccountConnected}>
          <p>{balance.formatted}</p>
          <button className={style.accountAddressButtonConnected} type="button">
            {getEllipsisTxt(account, 6)}
          </button>
        </div>
      </div>
      <button className={style.logout} type="button" onClick={logout}>
        Logout
      </button>
    </>
  );
  
}

const Logo = () => {
  return(
    <div  className="flex items-center">
    <img src={deadlockeLogo} alt="deadlocke" className={style.headerLogo}></img>
  </div>
  )
}

const Header = () => {

  return (
    <>
    <div className={style.wrapper}>
      <Logo />
      <div className={style.headerOptions}>
      <NetworkDropDown/>
      <Account/>
      </div>
    </div>
    </>
  );
};

export default Header;
