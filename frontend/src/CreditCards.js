import React from 'react';
import { injectStripe, StripeProvider, Elements, CardElement } from 'react-stripe-elements';

const INITIALSTATE = "INITIAL", SUCCESSSTATE = "COMPLETE", FAILEDSTATE = "FAILED";
class CreditCardForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            status: INITIALSTATE
        };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderCreditCardInformation = this.renderCreditCardInformation.bind(this);
    this.renderFailure = this.renderFailure.bind(this);
    this.renderSuccess = this.renderSuccess.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();
        let id = "";
       //If we are not using a pre-saved card, connect with stripe to obtain a card token
        if (!this.state.useExisting) {
           //Create the token via Stripe's API
            let { token } = await this.props.stripe.createToken({ name: this.state.name });
            if (token == null) {
                console.log("invalid token");
                this.setState({ status: FAILEDSTATE });
                return;
            }
            id = token.id;
        }
        //Create the request, then send it to the back-end
        let response = await fetch("/users/charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: id,
                customer_id: this.props.user,
                product_id: this.props.productid,
                sell_price: this.props.price,
                rememberCard: this.state.remember !== undefined,
                useExisting: this.state.useExisting
            })
        });
        //If response is ok, consider the operation a success
        if (response.ok) {
            console.log("Purchase Complete!");
            this.setState({ status: SUCCESSSTATE });
        } else {
            this.setState({ status: FAILEDSTATE });
        }
    }

    handleInputChange(event) {
        this.setState({
            value: event.target.value
        });
    }
    renderCreditCardInformation(){
        const style = {
              base: {
                  'fontSize': '20px',
                  'color': '#495057',
                  'fontFamily': 'apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
              }
        };
        const usersavedcard = <div>
            <div className="form-row text-center">
                <button type="button" className="btn btn-outline-success text-center mx-auto">Use saved card?</button>
            </div>
            <hr />
        </div>

        const remembercardcheck = <div className="form-row form-check text-center">
            <input className="form-check-input" type="checkbox" value="" id="remembercardcheck" />
            <label className="form-check-label" htmlFor="remembercardcheck">
                Remember Card?
            </label>
        </div>;
        return (
            <div>
                {usersavedcard}
                <h5 className="mb-4">Payment Info</h5>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-row">
                        <div className="col-lg-12 form-group">
                            <label htmlFor="cc-name">Name On Card:</label>
                            <input id="cc-name" name='cc-name' className="form-control" placeholder='Name on Card' onChange={this.handleInputChange} type='text' />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="col-lg-12 form-group">
                            <label htmlFor="card">Card Information:</label>
                            <CardElement id="card" className="form-control" style={style} />
                        </div>
                    </div>
                    {remembercardcheck}
                    <hr className="mb-4" />
                    <button type="submit" className="btn btn-success btn-large" >{this.props.operation}</button>
                </form>
            </div>
        );  
    }
    renderSuccess(){
        return (
            <div>
                <h5 className="mb-4 text-success">Request Successfull....</h5>
                <button type="submit" className="btn btn-success btn-large" onClick={() => { this.props.toggle() }}>Ok</button>
            </div>
        );
    }
    renderFailure(){
        return (
            <div>
                <h5 className="mb-4 text-danger"> Credit card information invalid, try again or exit</h5>
                {this.renderCreditCardInformation()}
            </div>
        );
    }
    
    render() {
        let body = null;
        switch (this.state.status) {
            case SUCCESSSTATE:
                body = this.renderSuccess();
                break;
            case FAILEDSTATE:
                body = this.renderFailure();
                break;
            default:
                body = this.renderCreditCardInformation();
        }

        return (
            <div>
                {body}
            </div>
        );
    }
}

export default function CreditCardInformation(props){
    if (!props.show) {
        return <div/>;
    }
   //inject our CreditCardForm component with stripe code in order to be able to make use of the createToken() method
    const CCFormWithStripe = injectStripe(CreditCardForm);
    return (
        <div>
            {/*stripe provider*/}
            <StripeProvider apiKey="pk_test_LwL4RUtinpP3PXzYirX2jNfR">
                <Elements>
                    {/*embed our credit card form*/}
                    <CCFormWithStripe operation={props.operation} />
                </Elements>
            </StripeProvider>
        </div>
    );
}