import * as types from './types';
import {signOut} from '../firebase/auth';
import * as query from '../firebase/queries';
import {firebaseRef,storageRef} from '../firebase';
import { toast } from 'react-toastify';


export const login = (user) => ({type:types.LOGIN,user});
export const logout = () => ({type:types.LOGOUT});

export function getProfileInfo(uid,ready) {
    return (dispatch) => {
        return firebaseRef.child(`users/${uid}`).once('value').then((doc) => {
            var values = doc.val();
            return storageRef.child(`users/${uid}/profile-picture`).getDownloadURL().then((downloadURL) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', downloadURL);
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    const blob = xhr.response;
                    const image = new File([blob], 'profile', {type: blob.type,lastModified: Date.now()});
                    const reader = new FileReader();
                    reader.onload = () =>  {
                        dispatch(addProfileInfo({...values,profilePic: reader.result}));
                        ready();
                    }
                    reader.readAsDataURL(image);
                }
                xhr.send();
            },(error) => {
                dispatch(removeProfilePicture())
                dispatch(addProfileInfo({...values}));
                ready();
            });
        });
    }
}

export function startSearch(searchCriteria,ready){
    return(dispatch,getState) => {
        var searchResults = {};
        firebaseRef.child(`users`).once('value').then((snapshot) => {
            Object
            .entries(snapshot.val())
            .forEach((searchResult) => {
                delete searchResult[1].graduations;
                delete searchResult[1].experiences;
                if(searchResult[0] !== getState().auth.user.uid && searchResult[1].firstName.toLowerCase().includes(searchCriteria.toLowerCase()))
                    searchResults = {...searchResults,[searchResult[0]]:searchResult[1]};
            });
            dispatch(addSearchResults(searchResults));
            ready();
        });
    }
}

export function addSearchResults(searchResults){
    return {
        type: types.ADD_SEARCH_RESULTS,
        payload: {...searchResults}
    }
}

export function addProfileInfo(userInfo) {
    return {
        type: types.ADD_PROFILE_INFO,
        payload: {
            ...userInfo
        }
    };
}

export function addProfilePicture(downloadURL) {
    return {
        type: types.ADD_PROFILE_PICTURE,
        payload: downloadURL
    }
}

export function removeProfilePicture() {
    return {
        type: types.REMOVE_PROFILE_PICTURE
    }
}

export function addExperience(experience,id) {
    return {
        type: types.ADD_EXPERIENCE,
        payload: {
            ...experience,
            id
        }
    };
}

export function startAddExperience(experience) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.saveExperience(experience,uid).then((result)=>{
            dispatch(addExperience(experience, result.key));
            toast.success("Experiência adicionada com sucesso.");
        },(error)=>{
            toast.error("Erro ao adicionar experiência.");
        });
    }
}

export function startEditExperience(experience,id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.editExperience(experience,uid,id).then((result)=>{
            dispatch(addExperience(experience, id));
            toast.success("Experiência editada com sucesso.");
        },(error)=>{
            toast.error("Erro ao editar experiência.");
        });
    }
}



export function startDeleteExperience(id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.deleteExperience(uid,id).then(()=>{
            dispatch(removeExperience(id));
            toast.success("Experiência excluída com sucesso.");
        });
    }
}


export function removeExperience(id){
    return {
        type: types.DELETE_EXPERIENCE,
        payload:{id}
    }
}

export function startAddJobOpportunity(jobOpportunity) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.saveJobOpportunity(jobOpportunity, uid).then((result) => {
            dispatch(addJobOpportunity(jobOpportunity, result.key));
            toast.success("Vaga adicionada com sucesso.");
        }, (error) => {
            toast.error("Erro ao adicionar vaga.");
        });
    }
}

export function addJobOpportunity(jobOpportunity, id) {
    return {
        type: types.ADD_JOB_OPPORTUNITY,
        payload: {
            ...jobOpportunity,
            id
        }
    };
}

export function startEditJobOpportunity(jobOpportunity, id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.editJobOpportunity(jobOpportunity, uid, id).then((result) => {
            dispatch(addJobOpportunity(jobOpportunity, id));
            toast.success("Vaga editada com sucesso.");
        }, (error) => {
            toast.error("Erro ao editar vaga.");
        });
    }
}

export function startDeleteJobOpportunity(id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.deleteJobOpportunity(uid, id).then(() => {
            dispatch(removeJobOpportunity(id));
            toast.success("Vaga excluída com sucesso.");
        });
    }
}

export function removeJobOpportunity(id) {
    return {type: types.DELETE_JOB_OPPORTUNITY, payload: {
            id
        }}
}

export function startLogout(callback) {
    return () => {
        return signOut().then((result) => {
            callback();
            return result;
        }, (error) => {
            return error;
        });
    }
}

export function startEditProfileInfo(userInfo) {
    return (dispatch, getState) => {
        const profilePic = userInfo.profilePic;
        delete userInfo.profilePic;
        Object.keys(userInfo).forEach(key => userInfo[key] === undefined ? delete userInfo[key] : '');
        return query.editProfile({...userInfo},getState().auth.user.uid).then((result) => {
            dispatch(addProfileInfo({...userInfo}));
            toast.success("Perfil editado com sucesso.");
            return dispatch(startUploadProfilePic(profilePic));
        });
    }
}

export function startUploadProfilePic(profilePic) {
    return (dispatch, getState) => {
        if(profilePic) {
            var upload = storageRef.child(`users/${getState().auth.user.uid}/profile-picture`).put(profilePic);
            return upload.on('state_changed', function (snapshot) {}, (error) => {}, function () {
                return upload.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    const image = new File([profilePic], 'profile', {type: profilePic.type,lastModified: Date.now()});
                    const reader = new FileReader();
                    reader.onload = () => dispatch(addProfilePicture(reader.result));
                    reader.readAsDataURL(image);
                });
            });
        } else {
            storageRef.child(`users/${getState().auth.user.uid}/profile-picture`).delete().then((result)=>{
                dispatch(removeProfilePicture());
            },(error)=>{

            })
        }
    }
}

export function addGraduation(graduation, id) {
    return {
        type: types.ADD_GRADUATION,
        payload: {
            ...graduation,
            id
        }
    };
}

export function startAddGraduation(graduation) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.saveGraduation(graduation, uid).then((result) => {
            dispatch(addGraduation(graduation, result.key));
            toast.success("Formação adicionada com sucesso.");
        },(error) => {
            toast.error("Erro ao adicionar formação.")
        });
    }
}

export function startEditGraduation(graduation, id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.editGraduation(graduation, uid, id).then(() => {
            dispatch(addGraduation(graduation, id));
            toast.success("Formação editada com sucesso.");
        },(error) => {
            toast.error("Erro ao editar formação.")
        });
    }
}

export function startDeleteGraduation(id) {
    return (dispatch, getState) => {
        const uid = getState().auth.user.uid;
        return query.deleteGraduation(uid, id).then(() => {
            dispatch(removeGraduation(id));
            toast.success("Formação excluída com sucesso.");
        });
    }
}

export function removeGraduation(id){
    return {
        type: types.DELETE_GRADUATION,
        payload:{id}
    }
}