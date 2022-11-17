import {React, useState, useEffect} from "react"
import { fetchSpecific} from '../pages/fetchFunctions';
import { changeAddress, changeEmail } from '../pages/changeFunctions';
import { useUser } from "./useUser";
import ProfilePicture from "./ProfilePicture";

const provinces = [
    "Ontario",
    "Quebec",
    "British Columbia",
    "Alberta",
    "Manitoba",
    "Saskatchewan",
    "Nova Scotia",
    "New Brusnwick",
    "Newfoundland and Labrador",
    "Prince Edward Island",
    "Northwest Territories",
    "Yukon",
    "Nunavut"
]

function manageAddress(ev) {
    const testRegex = RegExp("[a-zA-Z0-9 ]")
    if (!testRegex.test(ev.key)) {
        ev.preventDefault()
    }
}

function managePostalCode(ev) {
    if (ev.key.length > 1) {return}
    if (ev.target.value.length >= 6) {return}

    const testRegex = RegExp("[a-zA-Z0-9]")
    if (!testRegex.test(ev.key)) {
        ev.preventDefault()
    }
}

function manageOnlyText(ev) {
    const testRegex = RegExp("[A-Za-z ]")
    if (!testRegex.test(ev.key)) {
        ev.preventDefault()
    } 
}

function cleanEmptyJSON(JSON) {
    return Object.fromEntries(Object.entries(JSON).filter((details) => details[1] != ""))
}

function onSubmitAddress(e, Uid) {
    const address = cleanEmptyJSON({
        address1: e.target[0].value,
        address2: e.target[1].value,
        address3: e.target[2].value,
        province: e.target[3].value,
        city: e.target[4].value,
        postalCode: e.target[5].value
    })

    changeAddress(Uid, {address: address})
}

function onSubmitEmail(ev, Uid) {
    changeEmail(Uid, {email: ev.target[0].value})
}

function EditPersonal(props) {
    const [email, setEmail] = useState(null)
    const [address, setAddress] = useState(null)
    
    const user = useUser()
    // const [user, setUser] = useState(null)

    // useEffect(() => {
    //     function getProperties(user) {
    //         setUser(user)
    //         fetchSpecific(user.accountUid, "email")
    //         .then((email) => setEmail(email))
    //         fetchSpecific(user.accountUid, "address")
    //         .then((address) => setAddress(address.address))   
    //     }
    //     getUser(getProperties)
    // }, [])
    
    useEffect(() => {
        if (user == "loading") {return}
        fetchSpecific(user.accountUid, "email")
        .then((email) => setEmail(email))
        fetchSpecific(user.accountUid, "address")
        .then((address) => setAddress(address.address)) 
    }, [user])
    
    if (user == "loading" || email == null || address == null) {return (<></>)}
    
    const provinceSelect = document.querySelector(".province-select")
    
    if (provinceSelect) {
        provinceSelect.value = address.province
    }
    
    return (
        <div className="edit-container">
            <div className="edit-item" style={{marginTop: "35px"}}>
                <div>
                    <ProfilePicture pfpLink={user.pfpLink} />
                </div>
                <div >
                    <h1 style={{marginTop: "10px" ,fontSize: "25px"}}>
                        {user.username}
                    </h1>
                    <div className="info-text" style={{fontWeight: "600", marginTop: "25px"}}>Change Email</div> 
                    <div className="info-text">You can change your email without changing your address</div>
                </div>
            </div>
            <form onSubmit={(e) => onSubmitEmail(e, user.accountUid)}>
                <div className="edit-item" style={{marginTop: "10px"}}>
                    <div>
                        <label>Email</label>
                    </div>
                    <div>
                        <input style={{width: "100%"}} type="email" defaultValue={email} required></input>
                        <button className="submitBtn" style={{marginTop: "20px"}}>Change Email</button>
                        <div className="info-text" style={{fontWeight: "600", marginTop: "35px", marginBottom: "0px"}}>Change Address</div> 
                        <div className="info-text">You can change your adress without changing your email</div>
                    </div>
                </div>
            </form>
            <form onSubmit={(e) => onSubmitAddress(e, user.accountUid)}>
                <div className="edit-item" style={{marginTop: "13px"}}>
                    <div>
                        <label>Address1</label>
                    </div>
                    <input type="text" defaultValue={address.address1} onKeyDown={(e) => {manageAddress(e)}} required></input>
                </div>
                <div className="edit-item">
                    <div>
                        <label>Address2</label>
                    </div>
                    <input type="address" onKeyDown={(e) => {manageAddress(e)}} defaultValue={address.address2 ? address.address2: ""}></input>
                </div> 
                <div className="edit-item">
                    <div>
                        <label>Address3</label>
                    </div>
                    <input type="address" onKeyDown={(e) => {manageAddress(e)}} defaultValue={address.address3 ? address.address3: ""}></input>
                </div>  
                <div className="edit-item" >
                    <div>
                        <label>Province</label>
                    </div>
                    <div>
                        {/* <input style={{width: "100%"}} type="text" pattern={"[O|o]ntario|[Q|q]uebec|[B|b]ritish [C|c]olumbia|[A|a]lberta|[M|m]anitoba|[S|s]askatchewan|[N|n]ova [S|s]cotia|[N|n]ew [B|b]rusnwick|[N|n]ewfoundland and [L|l]abrador|[P|p]rince [E|e]dward [I|i]sland|[N|n]orthwest [T|t]erritories|[Y|y]ukon|[N|n]unavut"} 
                        defaultValue={address.province} onKeyDown={(e) => {
                            manageOnlyText(e)
                        }} 
                        required></input> */}
                        <select className="province-select">
                            <option value="Quebec">Quebec</option>
                            <option value="Ontario">Ontario</option>
                            <option value="British Columbia">British Columbia</option>
                            <option value="Alberta">Alberta</option>
                            <option value="Manitoba">Manitoba</option>
                            <option value="Saskatchewan">Saskatchewan</option>
                            <option value="Nova Scotia">Nova Scotia</option>
                            <option value="New Brusnwick">New Brusnwick</option>
                            <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                            <option value="Prince Edward Island">Prince Edward Island</option>
                            <option value="Northwest Territories">Northwest Territories</option>
                            <option value="Yukon">Yukon</option>
                            <option value="Nunavut">Nunavut</option>
                        </select>
                    </div>
                </div>
                <div className="edit-item" >
                    <div>
                        <label>City</label>
                    </div>
                    <div>
                        <input style={{width: "100%"}} type="text" defaultValue={address.city} onKeyDown={(e) => manageOnlyText(e)} required></input>
                    </div>
                </div>
                <div className="edit-item" >
                    <div>
                        <label>Postal Code</label>
                    </div>
                    <div>
                        <input style={{width: "100%", textTransform: "uppercase"}} type="text" defaultValue={address.postal_code} minLength="6" maxLength="6" pattern="^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$" onKeyDown={(e) => managePostalCode(e)} required></input>
                        <button className="submitBtn" style={{marginTop: "20px"}} required>Change address info</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditPersonal