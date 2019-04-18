import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {getUserInfo} from '../actions';
import {Container,Button,Modal} from 'react-bootstrap';
import placeholder from '../images/ppic-placeholder.jpg';
import backgroundPlaceholder from '../images/background-placeholder.png';
import ExperienceForm from './forms/ExperienceForm';
import EditProfileForm from './forms/EditProfileForm';
import List from './List';
import ReactPlaceholder from 'react-placeholder';
import {GRADUATION} from './ListItem';

const graduations = [
    {
        institution:'Pontifícia Universidade Católica de Minas Gerais',
        graduation: "Engineer's degree",
        area:"Computer Software Engineering",
        startDate:{year:2017},
        endDate:{year:2022}
    }
]

class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            showExperienceModal:false,
            showProfileModal:false,
            ready:false,
        }
        props.getUserInfo(this.loadingReady);
    }

    handleShowExperienceModal = () => {
        this.setState({showExperienceModal: true});
    }

    handleCloseExperienceModal = () => {
        this.setState({
            showExperienceModal: false
        });
    }

    handleShowProfileModal = () => {
        this.setState({showProfileModal: true});
    }

    handleCloseProfileModal = () => {
        this.setState({
            showProfileModal: false
        });
    }

    loadingReady = () => {
        this.setState({ready: true});
    }

    addExperience = () => {
        this.setState({editMode: false,initialValues:null});
        this.handleShowExperienceModal();
    }

    editExperience = (experience) => {
        this.setState({editMode: true,initialValues:{
            ...experience,
            startMonth: experience.startDate.month,
            startYear: experience.startDate.year,
            endYear: (experience.endDate ? experience.endDate.year : null),
            endMonth: (experience.endDate ? experience.endDate.month : null),
        }});
        this.handleShowExperienceModal();
    }

    addGraduation = () => {
        this.setState({editMode: false,initialValues:null});
        this.handleShowExperienceModal();
    }

    editExperience = (experience) => {
        this.setState({editMode: true,initialValues:{
            ...experience,
            startMonth: experience.startDate.month,
            startYear: experience.startDate.year,
            endYear: (experience.endDate ? experience.endDate.year : null),
            endMonth: (experience.endDate ? experience.endDate.month : null),
        }});
        this.handleShowExperienceModal();
    }


    renderLists(isEditable){
        if(this.state.ready){
            return(
                <Container className="card experiences">
                    <List title={"Experiências"}  items={this.props.experiences} listAction={isEditable ? this.addExperience : null} listItemAction={isEditable ? this.editExperience : null}/>
                    <List title={"Formação acadêmica"} items={graduations} listAction={isEditable ? this.addGraduation : null} type={GRADUATION} listItemAction={isEditable ? this.editGraduation : null}/>
                </Container>
            )
        }
    }

    render(){
        const {profilePic,backgroundPic,firstName,lastName,workLocation,occupation,desc} = this.props;
        const {ready} = this.state;
        const editable = this.props.location.pathname.substr(1) === this.props.uid;
        return(
            <>
            <ReactPlaceholder type='rect' style={{width:'100%',height: '250px'}} showLoadingAnimation={true} ready={this.state.ready}>
                <div className="background-pic" style={{background:`url(${backgroundPic ? backgroundPic : backgroundPlaceholder})`,backgroundPosition:'center'}}></div>
            </ReactPlaceholder>
            <Container className="card profile">
                    <div className="avatar">
                        <ReactPlaceholder type='round' showLoadingAnimation={true} ready={this.state.ready} style={{width:160,height: 160}}>
                            <img alt="profile-pic" src={profilePic ? profilePic : placeholder}/>
                        </ReactPlaceholder>
                    </div>
                    <div className="info">
                        <div className="title">
                            <ReactPlaceholder type='textRow' showLoadingAnimation={true} ready={this.state.ready} style={{width:170,height:30}}>
                                <h3 style={{fontWeight:'bold'}}>{firstName ? firstName + " " + lastName : 'Ronaldo'}</h3>
                            </ReactPlaceholder>
                        </div>
                        <ReactPlaceholder type='textRow' showLoadingAnimation={true} ready={this.state.ready} style={{width:250,height:20}}>
                            <h5 className="occupation">{occupation}</h5>
                        </ReactPlaceholder>
                        <ReactPlaceholder type='textRow' showLoadingAnimation={true} ready={this.state.ready} style={{width:250,height:20}}>
                            <p className="location">{workLocation}</p>
                        </ReactPlaceholder>
                        {editable && ready ? <Button className="edit-profile" onClick={this.handleShowProfileModal}>Editar Perfil</Button> : null}
                        <hr/>
                        <div className="desc" style={{textAlign:'justify'}}>
                            <ReactPlaceholder type='text' rows={8} showLoadingAnimation={true} ready={this.state.ready} style={{height:200}}>
                                {desc ? <p>{desc}</p> : <i style={{color:'grey',textAlign:'center',margin:'50px 0px',display:'block'}}>Nenhuma descrição</i>}
                            </ReactPlaceholder>
                        </div>
                    </div>
            </Container>
            {this.renderLists(editable)}
            <Modal show={this.state.showExperienceModal} onHide={this.handleCloseExperienceModal}>
                <ExperienceForm editMode={this.state.editMode} initialValues={this.state.initialValues} closeModal={this.handleCloseExperienceModal}/>
            </Modal>
            <Modal show={this.showGraduationModal} onHide={this.handleCloseGraduationModal}>
                <ExperienceForm editMode={this.state.editMode} initialValues={this.state.initialValues} closeModal={this.handleCloseGraduationModal}/>
            </Modal>
            <Modal show={this.state.showProfileModal} onHide={this.handleCloseProfileModal}>
                <EditProfileForm initialValues={{firstName,lastName,workLocation,occupation,desc,profilePic}} closeModal={this.handleCloseProfileModal}/>
            </Modal>
            </>
            
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    ...state.userInfo,
    uid: state.auth.user ? state.auth.user.uid : null
});

const mapDispatchToProps = (dispatch,ownProps) => ({
    getUserInfo: (ready) => dispatch(getUserInfo(ownProps.location.pathname.substr(1),ready))
});

export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Profile));